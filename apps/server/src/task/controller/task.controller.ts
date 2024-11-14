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
import { BaseResponse } from '../../common/BaseResponse';

@UseGuards(AccessTokenGuard)
@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  async create(@AuthUser() user: Account, @Body() body: CreateTaskRequest) {
    return new BaseResponse(
      200,
      '태스크가 정상적으로 생성되었습니다.',
      await this.taskService.create(body)
    );
  }

  @Get()
  async getAll(@Query('projectId') projectId: number) {
    return new BaseResponse(
      200,
      '태스크 목록이 정상적으로 조회되었습니다.',
      await this.taskService.getAll(projectId)
    );
  }

  @Patch(':id/status')
  async update(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() updateTaskRequest: UpdateTaskRequest
  ) {
    return new BaseResponse(
      200,
      '태스크가 정상적으로 수정되었습니다.',
      await this.taskService.update(id, user.id, updateTaskRequest)
    );
  }

  @Patch(':id/position')
  async move(@Param('id') id: number, @Body() moveTaskRequest: MoveTaskRequest) {
    return new BaseResponse(
      200,
      '태스크가 정상적으로 이동되었습니다.',
      await this.taskService.move(id, moveTaskRequest)
    );
  }

  @Get(':id')
  async get(@Param('id') id: number) {
    return new BaseResponse(
      200,
      '태스크가 정상적으로 조회되었습니다.',
      await this.taskService.get(id)
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return new BaseResponse(
      200,
      '태스크가 정상적으로 삭제되었습니다.',
      await this.taskService.delete(id)
    );
  }
}
