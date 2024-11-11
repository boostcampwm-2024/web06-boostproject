import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../domain/task.entity';
import { CreateTaskRequest } from '../dto/create-task-request.dto';
import { CreateTaskResponse } from '../dto/create-task-response.dto';
import { Section } from '../domain/section.entity';
import { UpdateTaskRequest } from '../dto/update-task-request.dto';
import { UpdateTaskResponse } from '../dto/update-task-response.dto';
import { LexoRank } from 'lexorank';

@Injectable()
export class TaskService {
	constructor(
		@InjectRepository(Task)
		private taskRepository: Repository<Task>,
		@InjectRepository(Section)
		private sectionRepository: Repository<Section>
	) {}

	async create(createTaskRequest: CreateTaskRequest) {
		const position: string = createTaskRequest.lastTaskPosition
			? LexoRank.parse(createTaskRequest.lastTaskPosition).genNext().toString()
			: LexoRank.min().toString();

		const task = await this.taskRepository.save({
			position,
		});
		return new CreateTaskResponse(task);
	}

	async update(id: number, updateTaskRequest: UpdateTaskRequest) {
		const task = await this.taskRepository.findOneBy({ id });
		if (!task) {
			throw new NotFoundException('Task not found');
		}

		task.title = updateTaskRequest.title ?? task.title;
		task.description = updateTaskRequest.description ?? task.description;

		const section = await this.sectionRepository.findOneBy({ id: updateTaskRequest.sectionId });
		if (!section) {
			throw new NotFoundException('Section not found');
		}
		task.section = section;

		await this.taskRepository.save(task);
		return new UpdateTaskResponse(task);
	}
}
