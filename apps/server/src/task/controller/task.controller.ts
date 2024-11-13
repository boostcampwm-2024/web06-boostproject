import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { UpdateTaskRequest } from '../dto/update-task-request.dto';
import { MoveTaskRequest } from '../dto/move-task-request.dto';
import { CreateTaskRequest } from '@/task/dto/create-task-request.dto';

@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

<<<<<<< HEAD
	@Post()
	createTask(@Body() createTaskRequest: CreateTaskRequest) {
		return this.taskService.create(createTaskRequest);
	}
=======
  @Post()
  create(@Body() createTaskRequest: CreateTaskRequest) {
    return this.taskService.create(createTaskRequest);
  }
>>>>>>> 7679844a70608707288d38f187371a9580eafb79

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
