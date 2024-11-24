import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Label } from '@/project/entity/label.entity';
import { Contributor } from '@/project/entity/contributor.entity';
import { ContributorStatus } from '@/project/enum/contributor-status.enum';
import { LabelDetailsResponse } from '@/project/dto/label-details-response.dto';
import { TaskLabel } from '@/task/domain/task-label.entity';

@Injectable()
export class LabelService {
  constructor(
    @InjectRepository(Label)
    private labelRepository: Repository<Label>,
    @InjectRepository(Contributor)
    private contributorRepository: Repository<Contributor>,
    private dataSource: DataSource
  ) {}

  async create(
    userId: number,
    projectId: number,
    title: string,
    description: string,
    color: string
  ) {
    await this.validateUserRole(userId, projectId);
    await this.validateDuplication(projectId, title, null);
    const label = await this.labelRepository.save({ projectId, title, description, color });
    return new LabelDetailsResponse(label);
  }

  async update(userId: number, labelId: number, title: string, description: string, color: string) {
    const label = await this.findLabelOrThrow(labelId);
    await this.validateUserRole(userId, label.projectId);
    await this.validateDuplication(label.projectId, title, label.id);
    label.update(title, description, color);
    await this.labelRepository.save(label);
    return new LabelDetailsResponse(label);
  }

  async delete(userId: number, labelId: number) {
    const label = await this.findLabelOrThrow(labelId);
    await this.validateUserRole(userId, label.projectId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.delete(TaskLabel, { labelId });
      await queryRunner.manager.delete(Label, { id: label.id });
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
    const labels = await this.labelRepository.findBy({ projectId });
    return labels.map((label) => new LabelDetailsResponse(label));
  }

  private async validateUserRole(userId: number, projectId: number) {
    const contributor = await this.contributorRepository.findOneBy({ projectId, userId });
    if (!contributor || contributor.status !== ContributorStatus.ACCEPTED) {
      throw new ForbiddenException('Permission denied');
    }
  }

  private async validateDuplication(projectId: number, title: string, id: number) {
    const duplication = await this.labelRepository
      .createQueryBuilder('label')
      .where('label.projectId = :projectId', { projectId })
      .andWhere('label.title = :title', { title })
      .andWhere('(:id IS NULL OR label.id != :id)', { id })
      .getRawOne();

    if (duplication) {
      throw new BadRequestException('Already used label name');
    }
  }

  private async findLabelOrThrow(id: number) {
    const label = await this.labelRepository.findOneBy({ id });
    if (!label) {
      throw new NotFoundException('Label not found');
    }
    return label;
  }
}
