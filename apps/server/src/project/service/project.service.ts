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
import { UserProjectsResponse } from '../dto/user-projects-response.dto';
import { Account } from '@/account/entity/account.entity';
import { ProjectContributorsResponse } from '../dto/project-contributors-response-dto';
import { UserInvitationResponse } from '../dto/user-invitation-response.dto';
import { Task } from '@/task/domain/task.entity';
import { TaskResponse } from '@/task/dto/task-response.dto';
import { CreateTaskRequest } from '../dto/create-task-request.dto';
import { LexoRank } from 'lexorank';
import { CreateTaskResponse } from '../dto/create-task-response.dto';

@Injectable()
export class ProjectService {
	constructor(
		private dataSource: DataSource,
		@InjectRepository(Project) private projectRepository: Repository<Project>,
		@InjectRepository(Contributor) private contributorRepository: Repository<Contributor>,
		@InjectRepository(Account) private accountRepository: Repository<Account>,
		@InjectRepository(Task) private taskRepository: Repository<Task>
	) {}

	async getUserProjects(userId: number) {
		const result = await this.contributorRepository
			.createQueryBuilder('c')
			.leftJoin('project', 'p', 'c.projectId = p.id')
			.where('c.userId = :userId', { userId })
			.andWhere('c.status = :status', { status: ContributorStatus.ACCEPTED })
			.addSelect(['p.title', 'p.createdAt'])
			.getRawMany();
		return result.map(
			(record: {
				c_projectId: number;
				p_title: string;
				p_createdAt: Date;
				c_role: ContributorStatus;
			}) => {
				return new UserProjectsResponse(record.c_role, {
					id: record.c_projectId,
					title: record.p_title,
					createdAt: record.p_createdAt,
				});
			}
		);
	}

	async getContributors(userId: number, projectId: number) {
		const userContributor = await this.contributorRepository.findOneBy({ userId, projectId });
		if (!userContributor) {
			throw new NotFoundException('Does not found user contributor or project');
		} else if (userContributor.status !== ContributorStatus.ACCEPTED) {
			throw new ForbiddenException('Permission denied');
		}
		const result = await this.contributorRepository
			.createQueryBuilder('c')
			.leftJoin('account', 'a', 'c.userId = a.id')
			.where('c.projectId = :projectId', { projectId })
			.andWhere('c.status = :status', { status: ContributorStatus.ACCEPTED })
			.addSelect(['a.id, a.username, c.role'])
			.getRawMany();
		return result.map((record: { id: number; username: string; role: ContributorStatus }) => {
			return new ProjectContributorsResponse(record.id, record.username, record.role);
		});
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

	async getTasks(projectId: number) {
		const tasks = await this.taskRepository.find({
			where: { section: { project: { id: projectId } } },
			relations: ['section'],
			select: ['id', 'title', 'description', 'position', 'section'],
		});

		const taskBySection = tasks.reduce((acc, task) => {
			const sectionName = task.section.name;

			if (!acc[sectionName]) {
				acc[sectionName] = [];
			}

			acc[sectionName].push(new TaskResponse(task));

			return acc;
		}, {});

		return taskBySection;
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

	async createTask(projectId: number, createTaskRequest: CreateTaskRequest) {
		const project = await this.projectRepository.findOneBy({ id: projectId });
		const position: string = createTaskRequest.lastTaskPosition
			? LexoRank.parse(createTaskRequest.lastTaskPosition).genNext().toString()
			: LexoRank.min().toString();

		const task = await this.taskRepository.save({
			position,
			project,
		});
		return new CreateTaskResponse(task);
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
