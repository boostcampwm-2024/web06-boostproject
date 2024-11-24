import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubTask } from '@/task/domain/subTask.entity';
import { Contributor } from '@/project/entity/contributor.entity';
import { Task } from '@/task/domain/task.entity';
import { ContributorStatus } from '@/project/enum/contributor-status.enum';
import { SubTaskStatus } from '@/task/enum/subTaskStatus.enum';
import { CreateSubTaskResponse } from '@/task/dto/create-subTask-response.dto';

@Injectable()
export class SubTaskService {
  constructor(
    @InjectRepository(SubTask)
    private subTaskRepository: Repository<SubTask>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Contributor)
    private contributorRepository: Repository<Contributor>
  ) {}

  async create(userId: number, taskId: number, content: string, completed: boolean) {
    await this.validateUserRole(userId, taskId);
    const subTask = await this.subTaskRepository.save({
      taskId,
      content: content || '',
      status: completed ? SubTaskStatus.COMPLETED : SubTaskStatus.PENDING,
    });
    return new CreateSubTaskResponse(subTask);
  }

  async update(userId: number, subTaskId: number, content: string, completed: boolean) {
    const subTask = await this.findSubTaskOrThrow(subTaskId);
    await this.validateUserRole(userId, subTask.taskId);
    subTask.update(content, completed);
    await this.subTaskRepository.save(subTask);
    return new CreateSubTaskResponse(subTask);
  }

  async delete(userId: number, subTaskId: number) {
    const subTask = await this.findSubTaskOrThrow(subTaskId);
    await this.validateUserRole(userId, subTask.taskId);
    await this.subTaskRepository.delete(subTask.id);
  }

  private async validateUserRole(userId: number, taskId: number) {
    const task = await this.findTaskOrThrow(taskId);
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
}
