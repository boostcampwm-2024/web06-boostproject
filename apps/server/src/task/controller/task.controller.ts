import { Body, Controller, Post } from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { CreateTaskRequest } from '../dto/create-task-request.dto';

@Controller('task')
export class TaskController {
	constructor(private taskService: TaskService) {}

	@Post()
	create(@Body() createTaskRequest: CreateTaskRequest) {
		return this.taskService.create(createTaskRequest);
	}
}
