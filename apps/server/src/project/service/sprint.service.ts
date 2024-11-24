import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sprint } from '@/project/entity/sprint.entity';
import { Contributor } from '@/project/entity/contributor.entity';
import { ContributorStatus } from '@/project/enum/contributor-status.enum';
import { SprintDetailsResponse } from '@/project/dto/sprint-details-response.dto';
import { Task } from '@/task/domain/task.entity';

@Injectable()
export class SprintService {
  constructor(
    @InjectRepository(Sprint)
    private sprintRepository: Repository<Sprint>,
    @InjectRepository(Contributor)
    private contributorRepository: Repository<Contributor>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>
  ) {}

  async create(
    userId: number,
    projectId: number,
    title: string,
    startDate: string,
    endDate: string
  ) {
    await this.validateUserRole(userId, projectId);
    this.validateDuration(startDate, endDate);
    const sprint = await this.sprintRepository.save({
      projectId,
      title,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    return new SprintDetailsResponse(sprint);
  }

  async update(
    userId: number,
    sprintId: number,
    title: string,
    startDate: string,
    endDate: string
  ) {
    const sprint = await this.findSprintOrThrow(sprintId);
    await this.validateUserRole(userId, sprint.projectId);
    this.validateDuration(startDate, endDate);
    sprint.update(title, startDate, endDate);
    await this.sprintRepository.save(sprint);
    return new SprintDetailsResponse(sprint);
  }

  async delete(userId: number, sprintId: number) {
    const sprint = await this.findSprintOrThrow(sprintId);
    await this.validateUserRole(userId, sprint.projectId);
    await this.taskRepository.update({ sprintId }, { sprintId: null });
    await this.sprintRepository.delete(sprint.id);
  }

  async getAll(userId: number, projectId: number) {
    await this.validateUserRole(userId, projectId);
    const sprints = await this.sprintRepository.findBy({ projectId });
    return sprints.map((sprint) => new SprintDetailsResponse(sprint));
  }

  private validateDuration(startDate: string, endDate: string) {
    const startedAt = new Date(startDate);
    const endedAt = new Date(endDate);
    if (endedAt < startedAt) {
      throw new BadRequestException('Invalid date duration');
    }
  }

  private async validateUserRole(userId: number, projectId: number) {
    const contributor = await this.contributorRepository.findOneBy({ projectId, userId });
    if (!contributor || contributor.status !== ContributorStatus.ACCEPTED) {
      throw new ForbiddenException('Permission denied');
    }
  }

  private async findSprintOrThrow(id: number) {
    const sprint = await this.sprintRepository.findOneBy({ id });
    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }
    return sprint;
  }
}
