import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from '../service/task.service';
import { UpdateTaskRequest } from '../dto/update-task-request.dto';
import { MoveTaskRequest } from '../dto/move-task-request.dto';
import { CreateTaskRequest } from '@/task/dto/create-task-request.dto';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';

@UseGuards(AccessTokenGuard)
@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  create(@AuthUser() user: Account, @Body() body: CreateTaskRequest) {
    return this.taskService.create(body);
  }

  @Get()
  getAll(@Query('projectId') projectId: number) {
    return this.taskService.getAll(projectId);
  }

  @Patch(':id/status')
  update(@AuthUser() user: Account, @Param('id') id: number, @Body() body: UpdateTaskRequest) {
    return this.taskService.update(id, user.id, body);
  }

  @Patch(':id/position')
  move(@Param('id') id: number, @Body() moveTaskRequest: MoveTaskRequest) {
    return this.taskService.move(id, moveTaskRequest);
  }

  @Get(':id')
  get(@Param('id') id: number) {
    return this.taskService.get(id);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.taskService.delete(id);
  }
}
