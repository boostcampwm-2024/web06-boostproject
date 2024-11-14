import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Project } from '../entity/project.entity';
import { Contributor } from '../entity/contributor.entity';
import { ContributorStatus } from '../enum/contributor-status.enum';
import { ProjectRole } from '../enum/project-role.enum';
import { CreateProjectResponse } from '../dto/create-project-response.dto';
import { Account } from '@/account/entity/account.entity';
import { UserInvitationResponse } from '../dto/user-invitation-response.dto';
import { Task } from '@/task/domain/task.entity';
import { TaskResponse } from '@/task/dto/task-response.dto';
import { BaseResponse } from '../../common/BaseResponse';

@Injectable()
export class ProjectService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    @InjectRepository(Contributor) private contributorRepository: Repository<Contributor>,
    @InjectRepository(Account) private accountRepository: Repository<Account>
  ) {}

  async getUserProjects(userId: number) {
    const records = await this.contributorRepository
      .createQueryBuilder('c')
      .leftJoin('project', 'p', 'c.projectId = p.id')
      .where('c.userId = :userId', { userId })
      .andWhere('c.status = :status', { status: ContributorStatus.ACCEPTED })
      .addSelect(['p.title', 'p.createdAt'])
      .getRawMany();

    const result =
      records.map(
        ({
          c_projectId: id,
          c_role: role,
          p_title: title,
          p_createdAt: createdAt,
        }: {
          c_projectId: number;
          p_title: string;
          p_createdAt: Date;
          c_role: ContributorStatus;
        }) => {
          return {
            id,
            title,
            createdAt,
            role,
          };
        }
      ) || [];

    return new BaseResponse(200, '프로젝트 목록 조회에 성공했습니다.', result);
  }

  async getContributors(userId: number, projectId: number) {
    const userContributor = await this.contributorRepository.findOneBy({ userId, projectId });
    if (!userContributor) {
      throw new NotFoundException('프로젝트가 존재하지 않습니다.');
    }

    if (userContributor.status !== ContributorStatus.ACCEPTED) {
      throw new ForbiddenException('아직 해당 프로젝트에 참여하지 않았습니다.');
    }

    const records = await this.contributorRepository
      .createQueryBuilder('c')
      .leftJoin('account', 'a', 'c.userId = a.id')
      .where('c.projectId = :projectId', { projectId })
      .andWhere('c.status = :status', { status: ContributorStatus.ACCEPTED })
      .addSelect(['a.id, a.username, c.role'])
      .getRawMany();

    const response = records.map(
      ({ id, username, role }: { id: number; username: string; role: ContributorStatus }) => {
        return {
          id,
          username,
          role,
        };
      }
    );

    return BaseResponse.create(200, '프로젝트 멤버 조회에 성공했습니다.', response);
  }

  async getInvitations(userId: number) {
    const result = await this.contributorRepository
      .createQueryBuilder('c')
      .leftJoin('project', 'p', 'c.projectId = p.id')
      .leftJoin('account', 'a', 'c.inviterId = a.id')
      .where('c.userId = :userId', { userId })
      .andWhere('c.status = :status', { status: ContributorStatus.PENDING })
      .addSelect(['p.title', 'a.username'])
      .getRawMany();
    return result.map(
      (record: { c_id: number; c_projectId: number; p_title: string; a_username: string }) => {
        return new UserInvitationResponse(
          record.c_id,
          record.c_projectId,
          record.p_title,
          record.a_username
        );
      }
    );
  }

  async create(userId: number, title: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const project = await queryRunner.manager.save(Project, { title });
      await queryRunner.manager.save(Contributor, {
        userId,
        inviterId: userId,
        projectId: project.id,
        status: ContributorStatus.ACCEPTED,
        role: ProjectRole.ADMIN,
      });
      await queryRunner.commitTransaction();
      return new CreateProjectResponse(project);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async invite(userId: number, projectId: number, username: string) {
    const userContributor = await this.contributorRepository.findOneBy({ userId, projectId });
    if (!userContributor) {
      throw new NotFoundException('Does not found user contributor or project');
    } else if (userContributor.role !== ProjectRole.ADMIN) {
      throw new ForbiddenException('Permission denied');
    }
    const invitee = await this.accountRepository.findOneBy({ username });
    if (!invitee) {
      throw new NotFoundException('Does not found username');
    }
    if (await this.contributorRepository.existsBy({ projectId, userId: invitee.id })) {
      throw new BadRequestException('Already existed invitation');
    }
    await this.contributorRepository.save({
      projectId,
      userId: invitee.id,
      inviterId: userId,
      status: ContributorStatus.PENDING,
      role: ProjectRole.GUEST,
    });
  }

  async updateInvitation(userId: number, contributorId: number, status: ContributorStatus) {
    const contributor = await this.contributorRepository.findOneBy({ id: contributorId });
    if (!contributor) {
      throw new NotFoundException('Does not found invitation');
    } else if (contributor.userId !== userId) {
      throw new ForbiddenException('Permission denied');
    } else if (contributor.status !== ContributorStatus.PENDING) {
      throw new BadRequestException('Already update invitation');
    }
    contributor.status = status;
    await this.contributorRepository.save(contributor);
  }
}
