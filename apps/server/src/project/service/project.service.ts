import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Project } from '@/project/entity/project.entity';
import { Contributor } from '@/project/entity/contributor.entity';
import { ContributorStatus } from '@/project/enum/contributor-status.enum';
import { ProjectRole } from '@/project/enum/project-role.enum';
import { CreateProjectResponse } from '@/project/dto/create-project-response.dto';
import { Account } from '@/account/entity/account.entity';
import { UserInvitationResponse } from '@/project/dto/user-invitation-response.dto';
import { Section } from '@/task/domain/section.entity';

@Injectable()
export class ProjectService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    @InjectRepository(Contributor) private contributorRepository: Repository<Contributor>,
    @InjectRepository(Account) private accountRepository: Repository<Account>
  ) {}

  async getProject(userId: number, projectId: number) {
    const project = await this.projectRepository.findOneBy({ id: projectId });
    const userContributor = await this.contributorRepository.findOneBy({ userId, projectId });

    if (!project || !userContributor || userContributor.status !== ContributorStatus.ACCEPTED) {
      throw new BadRequestException('Does not found project');
    }
    return new CreateProjectResponse(project);
  }

  async getUserProjects(userId: number) {
    const records = await this.contributorRepository
      .createQueryBuilder('c')
      .leftJoin('project', 'p', 'c.projectId = p.id')
      .where('c.userId = :userId', { userId })
      .andWhere('c.status = :status', { status: ContributorStatus.ACCEPTED })
      .addSelect(['p.title', 'p.createdAt'])
      .orderBy('p.title', 'ASC')
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

    return result;
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
      .orderBy(`CASE WHEN c.role = 'ADMIN' THEN 1 ELSE 2 END`, 'ASC')
      .getRawMany();

    const response = records.map(
      ({ id, username, role }: { id: number; username: string; role: ContributorStatus }) => {
        return {
          id,
          username,
          role,
          avatar: '',
        };
      }
    );

    return response;
  }

  async getInvitations(userId: number) {
    const result = await this.contributorRepository
      .createQueryBuilder('c')
      .leftJoin('project', 'p', 'c.projectId = p.id')
      .leftJoin('account', 'a', 'c.inviterId = a.id')
      .where('c.userId = :userId', { userId })
      .andWhere('c.status = :status', { status: ContributorStatus.PENDING })
      .addSelect(['p.title', 'a.username'])
      .orderBy('c.updatedAt', 'DESC')
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

      await queryRunner.manager.save(Section, { name: 'To Do', project });
      await queryRunner.manager.save(Section, { name: 'In Progress', project });
      await queryRunner.manager.save(Section, { name: 'Done', project });

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
    if (!userContributor || userContributor.role !== ProjectRole.ADMIN) {
      throw new ForbiddenException('Permission denied');
    }
    const invitee = await this.accountRepository.findOneBy({ username });
    if (!invitee) {
      throw new NotFoundException('Does not found username');
    }
    const contributor = await this.contributorRepository.findOneBy({
      projectId,
      userId: invitee.id,
    });
    if (contributor && contributor.status !== ContributorStatus.REJECTED) {
      throw new ConflictException('Already existed invitation');
    }
    if (contributor && contributor.status === ContributorStatus.REJECTED) {
      contributor.status = ContributorStatus.PENDING;
      await this.contributorRepository.save(contributor);
    }
    if (!contributor) {
      await this.contributorRepository.save({
        projectId,
        userId: invitee.id,
        inviterId: userId,
        status: ContributorStatus.PENDING,
        role: ProjectRole.GUEST,
      });
    }
  }

  async updateInvitation(
    userId: number,
    projectId: number,
    contributorId: number,
    status: ContributorStatus
  ) {
    const contributor = await this.contributorRepository.findOneBy({ id: contributorId });
    if (!contributor || contributor.projectId !== projectId) {
      throw new NotFoundException('Does not found invitation');
    }
    if (contributor.userId !== userId) {
      throw new ForbiddenException('Permission denied');
    }
    if (contributor.status === ContributorStatus.ACCEPTED) {
      throw new BadRequestException('Already update invitation');
    }
    contributor.status = status;
    await this.contributorRepository.save(contributor);
  }
}
