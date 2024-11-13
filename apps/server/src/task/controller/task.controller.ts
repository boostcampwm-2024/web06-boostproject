import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { CreateTaskRequest } from '../dto/create-task-request.dto';
import { UpdateTaskRequest } from '../dto/update-task-request.dto';
import { MoveTaskRequest } from '../dto/move-task-request.dto';

@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  create(@Body() createTaskRequest: CreateTaskRequest) {
    return this.taskService.create(createTaskRequest);
  }

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
