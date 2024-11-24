import { Body, Controller, Get, HttpCode, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { TaskService } from '@/task/service/task.service';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';
import { UpdateTaskDetailsRequest } from '@/task/dto/update-task-details-request.dto';

@UseGuards(AccessTokenGuard)
@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get()
  @ResponseMessage('태스크 목록이 정상적으로 조회되었습니다.')
  @HttpCode(200)
  async getAll(@AuthUser() user: Account, @Query('projectId') projectId: number) {
    return await this.taskService.getAll(user.id, projectId);
  }

  @Get(':id')
  @ResponseMessage('태스크가 정상적으로 조회되었습니다.')
  async get(@AuthUser() user: Account, @Param('id') id: number) {
    return await this.taskService.get(user.id, id);
  }

  @Patch(':id')
  @ResponseMessage('태스크 상세 정보 수정 완료했습니다.')
  async updateDetails(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: UpdateTaskDetailsRequest
  ) {
    return await this.taskService.updateDetails(user.id, id, body);
  }
}
