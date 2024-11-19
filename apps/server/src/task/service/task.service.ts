import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LexoRank } from 'lexorank';
import { Task } from '@/task/domain/task.entity';
import { Section } from '@/task/domain/section.entity';
import { MoveTaskRequest } from '@/task/dto/move-task-request.dto';
import { MoveTaskResponse } from '@/task/dto/move-task-response.dto';
import { TaskResponse } from '@/task/dto/task-response.dto';
import { DeleteTaskResponse } from '@/task/dto/delete-task-response.dto';
import { CreateTaskResponse } from '@/task/dto/create-task-response.dto';
import { Project } from '@/project/entity/project.entity';
import { CreateTaskRequest } from '@/task/dto/create-task-request.dto';
import { CustomResponse } from '@/task/domain/custom-response.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskEvent } from '../dto/task-event.dto';
import { EventType } from '../domain/eventType.enum';
import ShareDB from 'sharedb';

const json0 = ShareDB.types.json0;

@Injectable()
export class TaskService {
  private operations: Map<string, TaskEvent[]> = new Map();
  private connections: Map<string, CustomResponse[]> = new Map();

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    private eventEmitter: EventEmitter2
  ) {
    this.eventEmitter.on('operationAdded', async (userId: number, projectId: number) => {
      await this.dequeue(userId, projectId);
    });
  }

  addConnection(projectId: number, res: CustomResponse) {
    if (!this.connections.has(projectId.toString())) {
      this.connections.set(projectId.toString(), [res]);
    }
    this.connections.get(projectId.toString()).push(res);
  }

  removeConnection(projectId: number, res: CustomResponse) {
    const fillterdConnections = this.connections
      .get(projectId.toString())
      .filter((r) => r.userId !== res.userId);

    this.connections.set(projectId.toString(), fillterdConnections);
  }

  sendConnection(projectId: number, userId: number) {
    const connections = this.connections.get(projectId.toString());
    if (!connections) {
      return;
    }
  }

  async enqueue(userId: number, projectId: number, taskEvent: TaskEvent) {
    const key = projectId.toString();
    const currentEvents = this.operations.get(key) || [];
    this.operations.set(key, [...currentEvents, taskEvent]);
    this.eventEmitter.emit('operationAdded', userId, projectId);
  }

  private async dequeue(userId: number, projectId: number) {
    const key = projectId.toString();
    const changes = this.operations.get(key);
    if (!changes) {
      return;
    }

    while (changes) {
      const change = changes.shift();
      const existing = await this.findTaskOrThrow(change.taskId);
      const result = this.merge(change, existing);
      this.taskRepository.save(result);
      this.sendConnection(projectId, userId);
    }
  }

  private merge(change: TaskEvent, existing: Task) {
    const updateTitle = change.title;
    const existingTitle = existing.title;
    const event = change.event;
    const op = this.convertToShareDbOp(event, updateTitle, existingTitle);
    const newTitle = json0.type.apply(existingTitle, op);

    return { ...existing, title: newTitle };
  }

  private convertToShareDbOp(
    event: EventType,
    updateTitle: UpdateInformation,
    existingTitle: string
  ) {
    const { content, position, length } = updateTitle;

    switch (event) {
      case EventType.INSERT_TITLE:
        return [{ p: [position], si: content }];
      case EventType.DELETE_TITLE:
        return [
          {
            p: [position],
            sd: existingTitle.slice(position, position + length),
          },
        ];
    }
  }

  async create(createTaskRequest: CreateTaskRequest) {
    const project = await this.projectRepository.findOneBy({ id: createTaskRequest.projectId });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const sections = await this.sectionRepository.find({ where: { project } });
    const position: string = createTaskRequest.lastTaskPosition
      ? LexoRank.parse(createTaskRequest.lastTaskPosition).genNext().toString()
      : LexoRank.min().toString();

    const task = await this.taskRepository.save({
      position,
      section: sections[0],
    });
    return new CreateTaskResponse(task);
  }

  async getAll(projectId: number) {
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

  async move(id: number, moveTaskRequest: MoveTaskRequest) {
    const task = await this.findTaskOrThrow(id);

    const section = await this.findSectionOrThrow(moveTaskRequest.sectionId);
    task.section = section;

    const beforePosition = LexoRank.parse(moveTaskRequest.beforePosition);
    const afterPosition = LexoRank.parse(moveTaskRequest.afterPosition);
    task.position = beforePosition.between(afterPosition).toString();

    await this.taskRepository.save(task);
    return new MoveTaskResponse(task);
  }

  async get(id: number) {
    const task = await this.findTaskOrThrow(id);
    return new TaskResponse(task);
  }

  async delete(id: number) {
    await this.taskRepository.delete(id);
    return new DeleteTaskResponse(id);
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
