import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entity/project.entity';
import { Contributor } from '../entity/contributor.entity';
import { ContributorStatus } from '../enum/contributor-status.enum';
import { ProjectRole } from '../enum/project-role.enum';
import { CreateProjectResponse } from '../dto/create-project-response.dto';
import { UserProjectsResponse } from '../dto/user-projects-response.dto';

@Injectable()
export class ProjectService {
	constructor(
		@InjectRepository(Project) private projectRepository: Repository<Project>,
		@InjectRepository(Contributor) private contributorRepository: Repository<Contributor>
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
			(record: { p_id: number; p_title: string; p_createdAt: Date; c_role: ContributorStatus }) => {
				return new UserProjectsResponse(record.c_role, {
					id: record.p_id,
					title: record.p_title,
					createdAt: record.p_createdAt,
				});
			}
		);
	}

	async create(userId: number, title: string) {
		const project = await this.projectRepository.save({ title });
		await this.contributorRepository.save({
			userId,
			projectId: project.id,
			status: ContributorStatus.ACCEPTED,
			role: ProjectRole.ADMIN,
		});
		return new CreateProjectResponse(project);
	}
}
