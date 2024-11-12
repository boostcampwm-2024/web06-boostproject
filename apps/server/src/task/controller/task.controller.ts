import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { UpdateTaskRequest } from '../dto/update-task-request.dto';
import { MoveTaskRequest } from '../dto/move-task-request.dto';

@Controller('task')
export class TaskController {
	constructor(private taskService: TaskService) {}

	@Patch(':id/status')
	update(@Param('id') id: number, @Body() updateTaskRequest: UpdateTaskRequest) {
		return this.taskService.update(id, updateTaskRequest);
	}

	@Patch(':id/position')
	move(@Param('id') id: number, @Body() moveTaskRequest: MoveTaskRequest) {
		return this.taskService.move(id, moveTaskRequest);
	}

	@Get(':id')
	get(@Param('id') id: number) {
		return this.taskService.get(id);
	}
}
