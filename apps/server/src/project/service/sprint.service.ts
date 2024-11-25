import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    private taskRepository: Repository<Task>,
    private dataSource: DataSource
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
    await this.validateDuplication(projectId, title, null);
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
    await this.validateDuplication(sprint.projectId, title, sprintId);
    sprint.update(title, startDate, endDate);
    await this.sprintRepository.save(sprint);
    return new SprintDetailsResponse(sprint);
  }

  async delete(userId: number, sprintId: number) {
    const sprint = await this.findSprintOrThrow(sprintId);
    await this.validateUserRole(userId, sprint.projectId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.update(Task, { sprintId }, { sprintId: null });
      await queryRunner.manager.delete(Sprint, { id: sprint.id });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAll(userId: number, projectId: number) {
    await this.validateUserRole(userId, projectId);
    const sprints = await this.sprintRepository.findBy({ projectId });
    return sprints.map((sprint) => new SprintDetailsResponse(sprint));
  }

  private validateDuration(startDate: string, endDate: string) {
    if (!startDate && !endDate) {
      return;
    }
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

  private async validateDuplication(projectId: number, title: string, id: number) {
    if (!title) {
      return;
    }
    const duplication = await this.sprintRepository
      .createQueryBuilder('sprint')
      .where('sprint.projectId = :projectId', { projectId })
      .andWhere('sprint.title = :title', { title })
      .andWhere('(:id IS NULL OR sprint.id != :id)', { id })
      .getRawOne();

    if (duplication) {
      throw new BadRequestException('Already used sprint name');
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
