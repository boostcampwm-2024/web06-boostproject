import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
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
import { TaskEvent } from '@/task/dto/task-event.dto';
import { EventType } from '@/task/enum/eventType.enum';
import { Contributor } from '@/project/entity/contributor.entity';
import { BroadcastService } from '@/task/service/broadcast.service';
import { ContributorStatus } from '@/project/enum/contributor-status.enum';
import { TaskEventResponse } from '@/task/dto/task-event-response.dto';
import { UpdateTaskDetailsRequest } from '@/task/dto/update-task-details-request.dto';
import { UpdateTaskDetailsResponse } from '@/task/dto/update-task-details-response.dto';

const { defaultType: json0 } = ShareDB.types;

@Injectable()
export class TaskService {
  private logger = new Logger(TaskService.name);

  private operations: Map<number, TaskEvent[]> = new Map();

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
    @InjectRepository(Contributor)
    private contributorRepository: Repository<Contributor>,
    private broadcastService: BroadcastService,
    private eventEmitter: EventEmitter2
  ) {
    this.eventEmitter.on('broadcast', (userId: number, projectId: number, event: TaskEvent) => {
      this.broadcastService.sendConnection(userId, projectId, event);
    });
    this.eventEmitter.on(
      'operationAdded',
      async (userId: number, projectId: number, taskId: number) => {
        try {
          await this.dequeue(userId, projectId, taskId);
        } catch (e) {
          this.logger.error(e);
        }
      }
    );
  }

  async enqueue(userId: number, projectId: number, taskEvent: TaskEvent) {
    const { taskId } = taskEvent;
    await this.validateUserRole(userId, projectId);
    const currentEvents = this.operations.get(taskId) || [];
    this.operations.set(taskId, [...currentEvents, taskEvent]);
    this.eventEmitter.emit('operationAdded', userId, projectId, taskId);
  }

  private async dequeue(userId: number, projectId: number, taskId: number) {
    const taskEventQueue = this.operations.get(taskId);
    if (!taskEventQueue) {
      return;
    }

    const initialTask = await this.taskRepository.findOneBy({ id: taskId });
    let accumulateOperations = [];
    while (taskEventQueue.length) {
      const taskEvent = taskEventQueue.shift();
      const operation = this.convertToOperation(taskEvent);

      const transformedOperation = accumulateOperations.length
        ? json0.transform(operation, accumulateOperations, 'right')
        : operation;

      accumulateOperations = json0.compose(accumulateOperations, transformedOperation);
    }

    const newText = json0.apply(initialTask.title, accumulateOperations);
    const result = { ...initialTask, title: newText };
    await this.taskRepository.save(result);
    const eventPublisher = accumulateOperations.length <= 1 ? userId : null;
    this.eventEmitter.emit(
      'broadcast',
      eventPublisher,
      projectId,
      TaskEventResponse.of(taskId, 'TITLE')
    );
  }

  private convertToOperation(taskEvent: TaskEvent) {
    const { event } = taskEvent;
    const { content, position } = taskEvent.title;

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
    await this.validateUserRole(userId, projectId);
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

    this.eventEmitter.emit('broadcast', userId, projectId, TaskEventResponse.of(task.id, 'CARD'));
    return new CreateTaskResponse(task);
  }

  async getAll(userId: number, projectId: number) {
    await this.validateUserRole(userId, projectId);
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
    await this.validateUserRole(userId, projectId);
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

    this.eventEmitter.emit(
      'broadcast',
      userId,
      projectId,
      TaskEventResponse.of(taskEvent.taskId, 'CARD')
    );
    return new MoveTaskResponse(task);
  }

  async updateDetails(userId: number, taskId: number, body: UpdateTaskDetailsRequest) {
    const task = await this.findTaskOrThrow(taskId);
    await this.validateUserRole(userId, task.section.project.id);
    // required sprint id check
    task.updateDetails(body);
    this.taskRepository.save(task);
    return new UpdateTaskDetailsResponse(task.id, body);
  }

  async get(userId: number, taskId: number) {
    const task = await this.findTaskOrThrow(taskId);
    await this.validateUserRole(userId, task.section.project.id);
    return new TaskResponse(task);
  }

  async delete(userId: number, projectId: number, taskEvent: TaskEvent) {
    await this.validateUserRole(userId, projectId);
    if (!taskEvent.taskId) {
      throw new BadRequestException('Required section id');
    }
    const task = await this.findTaskOrThrow(taskEvent.taskId);
    if (!task || task.section.project.id !== projectId) {
      throw new NotFoundException('Task not found');
    }
    await this.taskRepository.delete(taskEvent.taskId);

    this.eventEmitter.emit(
      'broadcast',
      userId,
      projectId,
      TaskEventResponse.of(taskEvent.taskId, 'CARD')
    );
    return new DeleteTaskResponse(taskEvent.taskId);
  }

  private async validateUserRole(userId: number, projectId: number) {
    const contributor = await this.contributorRepository.findOneBy({ projectId, userId });
    if (!contributor || contributor.status !== ContributorStatus.ACCEPTED) {
      throw new ForbiddenException('Permission denied');
    }
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
