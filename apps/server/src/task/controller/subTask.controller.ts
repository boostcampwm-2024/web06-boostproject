import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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

  @Post()
  async create(@AuthUser() user: Account, @Query('taskId') taskId: number) {
    return new BaseResponse(
      201,
      '서브 태스크 생성 완료했습니다.',
      await this.subTaskService.create(user.id, taskId)
    );
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @AuthUser() user: Account,
    @Param('id') subTaskId: number,
    @Query('taskId') taskId: number,
    @Body() body: UpdateSubTaskRequest
  ) {
    return new BaseResponse(
      200,
      '서브 태스크 수정 완료했습니다.',
      await this.subTaskService.update(user.id, subTaskId, taskId, body.content, body.completed)
    );
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(
    @AuthUser() user: Account,
    @Param('id') subTaskId: number,
    @Query('taskId') taskId: number
  ) {
    await this.subTaskService.delete(user.id, subTaskId, taskId);
    return new BaseResponse(200, '서브 태스크 삭제 완료했습니다.', {});
  }
}
