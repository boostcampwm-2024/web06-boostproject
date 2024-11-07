import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../domain/task.entity';
import { CreateTaskRequest } from '../dto/create-task-request.dto';
import { CreateTaskResponse } from '../dto/create-task-response.dto';
import { Section } from '../domain/section.entity';

@Injectable()
export class TaskService {
	constructor(
		@InjectRepository(Task)
		private taskRepository: Repository<Task>,
		@InjectRepository(Section)
		private sectionRepository: Repository<Section>
	) {}

	async create(createTaskRequest: CreateTaskRequest) {
		const section = await this.sectionRepository.findOneBy({ id: createTaskRequest.sectionId });
		const task = await this.taskRepository.save({
			position: createTaskRequest.position,
			section,
		});
		return new CreateTaskResponse(task);
	}
}
