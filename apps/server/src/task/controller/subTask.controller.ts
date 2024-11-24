import { Body, Controller, Delete, HttpCode, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { BaseResponse } from '@/common/BaseResponse';
import { SubTaskService } from '@/task/service/subTask.service';
import { UpdateSubTaskRequest } from '@/task/dto/update-subTask-request.dto';

@UseGuards(AccessTokenGuard)
@Controller('subtask')
export class SubTaskController {
  constructor(private subTaskService: SubTaskService) {}

  @Patch(':id')
  @HttpCode(200)
  async update(
    @AuthUser() user: Account,
    @Param('id') subTaskId: number,
    @Body() body: UpdateSubTaskRequest
  ) {
    return new BaseResponse(
      200,
      '서브 태스크 수정 완료했습니다.',
      await this.subTaskService.update(user.id, subTaskId, body.content, body.completed)
    );
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@AuthUser() user: Account, @Param('id') subTaskId: number) {
    await this.subTaskService.delete(user.id, subTaskId);
    return new BaseResponse(200, '서브 태스크 삭제 완료했습니다.', {});
  }
}
