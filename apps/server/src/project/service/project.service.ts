import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entity/project.entity';
import { Contributor } from '../entity/contributor.entity';
import { ContributorStatus } from '../enum/contributor-status.enum';
import { ProjectRole } from '../enum/project-role.enum';
import { CreateProjectResponse } from '../dto/create-project-response.dto';

@Injectable()
export class ProjectService {
	constructor(
		@InjectRepository(Project) private projectRepository: Repository<Project>,
		@InjectRepository(Contributor) private contributorRepository: Repository<Contributor>
	) {}

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
