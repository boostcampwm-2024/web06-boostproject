import { Project } from '../entity/project.entity';

export class CreateProjectResponse {
	id: number;

	title: string;

	constructor(project: Project) {
		this.id = project.id;
		this.title = project.title;
	}
}
