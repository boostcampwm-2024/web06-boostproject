import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubTask } from '@/task/domain/subTask.entity';
import { Contributor } from '@/project/entity/contributor.entity';
import { Task } from '@/task/domain/task.entity';
import { ContributorStatus } from '@/project/enum/contributor-status.enum';
import { SubTaskStatus } from '@/task/enum/subTaskStatus.enum';
import { CreateSubTaskResponse } from '@/task/dto/create-subTask-response.dto';
import { TaskEventResponse } from '@/task/dto/task-event-response.dto';
import { EventType } from '@/task/enum/eventType.enum';
import { SubTaskChangedEvent } from '@/task/event/subtask-changed.event';

@Injectable()
export class SubTaskService {
  constructor(
    @InjectRepository(SubTask)
    private subTaskRepository: Repository<SubTask>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Contributor)
    private contributorRepository: Repository<Contributor>,
    private eventEmitter: EventEmitter2
  ) {}

  async create(userId: number, taskId: number, content: string, completed: boolean) {
    const task = await this.findTaskOrThrow(taskId);
    await this.validateUserRole(userId, task);
    const subTask = await this.subTaskRepository.save({
      taskId,
      content: content || '',
      status: completed ? SubTaskStatus.COMPLETED : SubTaskStatus.PENDING,
    });
    await this.broadcast(userId, task.id, task.section.project.id);
    return new CreateSubTaskResponse(subTask);
  }

  async update(userId: number, subTaskId: number, content: string, completed: boolean) {
    const subTask = await this.findSubTaskOrThrow(subTaskId);
    const task = await this.findTaskOrThrow(subTask.taskId);
    await this.validateUserRole(userId, task);
    const beforeStatus = subTask.status;
    subTask.update(content, completed);
    await this.subTaskRepository.save(subTask);
    if (subTask.status !== beforeStatus) {
      await this.broadcast(userId, task.id, task.section.project.id);
    }
    return new CreateSubTaskResponse(subTask);
  }

  async delete(userId: number, subTaskId: number) {
    const subTask = await this.findSubTaskOrThrow(subTaskId);
    const task = await this.findTaskOrThrow(subTask.taskId);
    await this.validateUserRole(userId, task);
    await this.subTaskRepository.delete(subTask.id);
    await this.broadcast(userId, task.id, task.section.project.id);
  }

  private async validateUserRole(userId: number, task: Task) {
    const contributor = await this.contributorRepository.findOneBy({
      userId,
      projectId: task.section.project.id,
    });
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

  private async findSubTaskOrThrow(id: number) {
    const subTask = await this.subTaskRepository.findOneBy({ id });
    if (!subTask) {
      throw new NotFoundException('SubTask not found');
    }
    return subTask;
  }

  private async broadcast(userId: number, taskId: number, projectId: number) {
    const subTasks = await this.subTaskRepository.findBy({ taskId });
    const statistic = {
      total: subTasks.length,
      completed: subTasks.filter((sub) => sub.status === SubTaskStatus.COMPLETED).length,
    };
    this.eventEmitter.emit(
      'broadcast',
      userId,
      projectId,
      new TaskEventResponse(
        EventType.SUBTASK_CHANGED,
        new SubTaskChangedEvent(taskId, statistic.total, statistic.completed)
      )
    );
  }
}
