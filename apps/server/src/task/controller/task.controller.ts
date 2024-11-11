import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { CreateTaskRequest } from '../dto/create-task-request.dto';
import { UpdateTaskRequest } from '../dto/update-task-request.dto';

@Controller('task')
export class TaskController {
	constructor(private taskService: TaskService) {}

	@Post()
	create(@Body() createTaskRequest: CreateTaskRequest) {
		return this.taskService.create(createTaskRequest);
	}

	@Patch(':id')
	update(@Param('id') id: number, @Body() updateTaskRequest: UpdateTaskRequest) {
		return this.taskService.update(id, updateTaskRequest);
	}
}
