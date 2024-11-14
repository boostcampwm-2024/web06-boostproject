import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LexoRank } from 'lexorank';
import { Task } from '@/task/domain/task.entity';
import { Section } from '@/task/domain/section.entity';
import { UpdateTaskRequest } from '@/task/dto/update-task-request.dto';
import { UpdateTaskResponse } from '@/task/dto/update-task-response.dto';
import { MoveTaskRequest } from '@/task/dto/move-task-request.dto';
import { MoveTaskResponse } from '@/task/dto/move-task-response.dto';
import { TaskResponse } from '@/task/dto/task-response.dto';
import { DeleteTaskResponse } from '@/task/dto/delete-task-response.dto';
import { CreateTaskResponse } from '@/task/dto/create-task-response.dto';
import { Project } from '@/project/entity/project.entity';
import { CreateTaskRequest } from '@/task/dto/create-task-request.dto';
import { Snapshot } from '@/task/domain/snapshot';
import { CustomResponse } from '@/task/domain/custom-response.interface';

@Injectable()
export class TaskService {
  private snapshots: Map<string, Snapshot> = new Map();

  private connections: Map<string, CustomResponse[]> = new Map();

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>
  ) {}

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

    connections.forEach((res) => {
      if (res.userId !== userId) {
        const snapshot = this.snapshots.get(projectId.toString());
        if (res.headersSent) {
          return;
        }
        res.json({
          status: 200,
          message: '스냅샷에 변경 사항이 발생했습니다.',
          result: {
            version: snapshot.version,
            project: snapshot.project,
          },
        });
      }
    });
  }

  private updateSnapshot(
    projectId: number,
    prevSectionId: number,
    userId: number,
    savedTask: Task
  ) {
    const snapshot = this.snapshots.get(projectId.toString());
    if (!snapshot) {
      throw new NotFoundException('Snapshot not found');
    }
    snapshot.update(prevSectionId, savedTask);
    this.sendConnection(projectId, userId);
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

    this.snapshots.set(projectId.toString(), new Snapshot(taskBySection));

    return taskBySection;
  }

  async update(id: number, userId: number, updateTaskRequest: UpdateTaskRequest) {
    const prevTask = await this.findTaskOrThrow(id);
    const prevSectionId = prevTask.section.id;
    const projectId = prevTask.section.project.id;

    const newTask = new Task();
    newTask.title = updateTaskRequest.title ?? prevTask.title;
    newTask.description = updateTaskRequest.description ?? prevTask.description;

    if (updateTaskRequest.sectionId) {
      const section = await this.findSectionOrThrow(updateTaskRequest.sectionId);
      newTask.section = section;
    }

    const savedTask = await this.taskRepository.save(newTask);

    this.updateSnapshot(projectId, prevSectionId, userId, savedTask);

    return new UpdateTaskResponse(savedTask);
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
