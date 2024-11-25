import { Body, Controller, Delete, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { SubTaskService } from '@/task/service/subTask.service';
import { UpdateSubTaskRequest } from '@/task/dto/update-subTask-request.dto';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';

@UseGuards(AccessTokenGuard)
@Controller('subtask')
export class SubTaskController {
  constructor(private subTaskService: SubTaskService) {}

  @Patch(':id')
  @ResponseMessage('서브 태스크 수정 완료했습니다.')
  async update(
    @AuthUser() user: Account,
    @Param('id') subTaskId: number,
    @Body() body: UpdateSubTaskRequest
  ) {
    return this.subTaskService.update(user.id, subTaskId, body.content, body.completed);
  }

  @Delete(':id')
  @ResponseMessage('서브 태스크 삭제 완료했습니다.')
  async delete(@AuthUser() user: Account, @Param('id') subTaskId: number) {
    return this.subTaskService.delete(user.id, subTaskId);
  }
}
