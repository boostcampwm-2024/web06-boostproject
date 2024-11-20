import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TaskService } from '@/task/service/task.service';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { BaseResponse } from '@/common/BaseResponse';

@UseGuards(AccessTokenGuard)
@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  async getAll(@AuthUser() user: Account, @Query('projectId') projectId: number) {
    return new BaseResponse(
      200,
      '태스크 목록이 정상적으로 조회되었습니다.',
      await this.taskService.getAll(user.id, projectId)
    );
  }

  @Get(':id')
  async get(@AuthUser() user: Account, @Param('id') id: number) {
    return new BaseResponse(
      200,
      '태스크가 정상적으로 조회되었습니다.',
      await this.taskService.get(user.id, id)
    );
  }
}
