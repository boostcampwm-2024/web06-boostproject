import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as ShareDB from 'sharedb';
import { Task } from '@/task/domain/task.entity';
import { Section } from '@/task/domain/section.entity';
import { MoveTaskResponse } from '@/task/dto/move-task-response.dto';
import { TaskResponse } from '@/task/dto/task-response.dto';
import { DeleteTaskResponse } from '@/task/dto/delete-task-response.dto';
import { CreateTaskResponse } from '@/task/dto/create-task-response.dto';
import { Project } from '@/project/entity/project.entity';
import { TaskEvent } from '@/task/dto/task-event.dto';
import { EventType } from '@/task/domain/eventType.enum';
import { Contributor } from '@/project/entity/contributor.entity';
import { BroadcastService } from '@/task/service/broadcast.service';
import { ContributorStatus } from '@/project/enum/contributor-status.enum';
import { TaskEventResponse } from '@/task/dto/task-event-response.dto';
import { UpdateInformation } from '@/task/domain/update-information.type';

const { defaultType: json0 } = ShareDB.types;

@Injectable()
export class TaskService {
  private operations: Map<number, TaskEvent[]> = new Map();

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Contributor)
    private contributorRepository: Repository<Contributor>,
    private broadcastService: BroadcastService,
    private eventEmitter: EventEmitter2
  ) {
    this.eventEmitter.on('broadcast', (userId: number, projectId: number, event: TaskEvent) => {
      this.broadcastService.sendConnection(userId, projectId, event);
    });
    this.eventEmitter.on('operationAdded', async (userId: number, projectId: number) => {
      await this.dequeue(userId, projectId);
    });
  }

  async enqueue(userId: number, projectId: number, taskEvent: TaskEvent) {
    const key = projectId;
    const contributor = await this.contributorRepository.findOneBy({ projectId, userId });
    if (!contributor || contributor.status !== ContributorStatus.ACCEPTED) {
      throw new ForbiddenException('Permission denied');
    }
    const currentEvents = this.operations.get(key) || [];
    this.operations.set(key, [...currentEvents, taskEvent]);
    this.eventEmitter.emit('operationAdded', userId, projectId);
  }

  private async dequeue(userId: number, projectId: number) {
    const key = projectId;
    const taskEvents = this.operations.get(key);
    if (!taskEvents) {
      return;
    }

    let lastOp = [];
    while (taskEvents.length) {
      const taskEvent = taskEvents.shift();
      const existing = await this.findTaskOrThrow(taskEvent.taskId);
      const result = this.merge(taskEvent, existing);

      const transformedOp = lastOp.length ? json0.transform(result, lastOp, 'right') : result;

      this.taskRepository.save(result);

      this.eventEmitter.emit('broadcast', userId, projectId, TaskEventResponse.from(taskEvent));

      lastOp = json0.compose(lastOp, transformedOp);
    }
  }

  private merge(change: TaskEvent, existing: Task) {
    const updateTitle = change.title;
    const existingTitle = existing.title;
    const { event } = change;
    const op = this.convertToShareDbOp(event, updateTitle);

    const newTitle = json0.apply(existingTitle, op);

    return { ...existing, title: newTitle };
  }

  private convertToShareDbOp(event: EventType, updateTitle: UpdateInformation) {
    const { content, position } = updateTitle;

    switch (event) {
      case EventType.INSERT_TITLE:
        return [{ p: [position], si: content }];
      case EventType.DELETE_TITLE:
        return [{ p: [position], sd: content }];
      default:
        throw new BadRequestException('Invalid event type');
    }
  }

  async create(userId: number, projectId: number, taskEvent: TaskEvent) {
    const contributor = await this.contributorRepository.findOneBy({ projectId, userId });
    if (!contributor || contributor.status !== ContributorStatus.ACCEPTED) {
      throw new ForbiddenException('Permission denied');
    }
    if (!taskEvent.sectionId) {
      throw new BadRequestException('Required section id');
    }
    const section = await this.findSectionOrThrow(taskEvent.sectionId);
    if (section.project.id !== projectId) {
      throw new NotFoundException('Project not found');
    }
    const task = await this.taskRepository.save({
      position: taskEvent.position,
      section,
    });

    this.eventEmitter.emit(
      'broadcast',
      userId,
      projectId,
      TaskEventResponse.of(task.id, taskEvent)
    );
    return new CreateTaskResponse(task);
  }

  async getAll(userId: number, projectId: number) {
    const contributor = await this.contributorRepository.findOneBy({ projectId, userId });
    if (!contributor || contributor.status !== ContributorStatus.ACCEPTED) {
      throw new ForbiddenException('Permission denied');
    }
    const sections = await this.sectionRepository.find({
      where: { project: { id: projectId } },
      order: { id: 'ASC' },
    });

    const tasks = await this.taskRepository.find({
      where: { section: { project: { id: projectId } } },
      relations: ['section'],
      select: ['id', 'title', 'description', 'position', 'section'],
    });

    const taskBySection = [];
    sections.forEach((section) => {
      taskBySection.push({
        id: section.id,
        name: section.name,
        tasks: tasks
          .filter((task) => task.section.id === section.id)
          .map((task) => new TaskResponse(task)),
      });
    });

    return taskBySection;
  }

  async move(userId: number, projectId: number, taskEvent: TaskEvent) {
    const contributor = await this.contributorRepository.findOneBy({ projectId, userId });
    if (!contributor || contributor.status !== ContributorStatus.ACCEPTED) {
      throw new ForbiddenException('Permission denied');
    }
    if (!taskEvent.taskId || !taskEvent.sectionId || !taskEvent.position) {
      throw new BadRequestException('Required section id');
    }
    const task = await this.findTaskOrThrow(taskEvent.taskId);
    const section = await this.findSectionOrThrow(taskEvent.sectionId);
    if (task.section.project.id !== projectId || section.project.id !== projectId) {
      throw new NotFoundException('Project not found');
    }
    task.position = taskEvent.position;
    task.section = section;
    await this.taskRepository.save(task);

    this.eventEmitter.emit('broadcast', userId, projectId, TaskEventResponse.from(taskEvent));
    return new MoveTaskResponse(task);
  }

  async get(userId: number, taskId: number) {
    const task = await this.findTaskOrThrow(taskId);
    const contributor = await this.contributorRepository.findOneBy({
      userId,
      projectId: task.section.project.id,
    });
    if (!contributor || contributor.status !== ContributorStatus.ACCEPTED) {
      throw new ForbiddenException('Permission denied');
    }
    return new TaskResponse(task);
  }

  async delete(userId: number, projectId: number, taskEvent: TaskEvent) {
    const contributor = await this.contributorRepository.findOneBy({ projectId, userId });
    if (!contributor || contributor.status !== ContributorStatus.ACCEPTED) {
      throw new ForbiddenException('Permission denied');
    }
    if (!taskEvent.taskId) {
      throw new BadRequestException('Required section id');
    }
    const task = await this.findTaskOrThrow(taskEvent.taskId);
    if (!task || task.section.project.id !== projectId) {
      throw new NotFoundException('Task not found');
    }
    await this.taskRepository.delete(taskEvent.taskId);

    this.eventEmitter.emit('broadcast', userId, projectId, TaskEventResponse.from(taskEvent));
    return new DeleteTaskResponse(taskEvent.taskId);
  }

  private async findTaskOrThrow(id: number) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['section', 'section.project'],
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  private async findSectionOrThrow(id: number) {
    const section = await this.sectionRepository.findOne({ where: { id }, relations: ['project'] });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    return section;
  }
}
