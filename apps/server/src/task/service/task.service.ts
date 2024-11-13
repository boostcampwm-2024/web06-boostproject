import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LexoRank } from 'lexorank';
import { Task } from '../domain/task.entity';
import { Section } from '../domain/section.entity';
import { UpdateTaskRequest } from '../dto/update-task-request.dto';
import { UpdateTaskResponse } from '../dto/update-task-response.dto';
import { MoveTaskRequest } from '../dto/move-task-request.dto';
import { MoveTaskResponse } from '../dto/move-task-response.dto';
import { TaskResponse } from '../dto/task-response.dto';
import { CreateTaskResponse } from '@/task/dto/create-task-response.dto';
import { Project } from '@/project/entity/project.entity';
import { CreateTaskRequest } from '@/task/dto/create-task-request.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>
  ) {}

  async create(createTaskRequest: CreateTaskRequest) {
    const project = await this.projectRepository.findOneBy({ id: createTaskRequest.projectId });
    if (!project) {
      throw new Error('Project not found');
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

  async update(id: number, updateTaskRequest: UpdateTaskRequest) {
    const task = await this.findTaskOrThrow(id);

    task.title = updateTaskRequest.title ?? task.title;
    task.description = updateTaskRequest.description ?? task.description;

    const section = await this.findSectionOrThrow(updateTaskRequest.sectionId);
    task.section = section;

    await this.taskRepository.save(task);
    return new UpdateTaskResponse(task);
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

  private async findTaskOrThrow(id: number) {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  private async findSectionOrThrow(id: number) {
    const section = await this.sectionRepository.findOneBy({ id });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    return section;
  }
}
