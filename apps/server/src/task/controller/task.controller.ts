import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from '@/task/service/task.service';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';
import { UpdateTaskDetailsRequest } from '@/task/dto/update-task-details-request.dto';
import { SubTaskService } from '@/task/service/subTask.service';
import { CreateSubTaskRequest } from '@/task/dto/create-subTask-request.dto';
import { UpdateLabelsRequest } from '@/task/dto/update-labels-request.dto';

@UseGuards(AccessTokenGuard)
@Controller('task')
export class TaskController {
  constructor(
    private taskService: TaskService,
    private subTaskService: SubTaskService
  ) {}

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

  @Post(':id/subtask')
  @ResponseMessage('서브 태스크 생성 완료했습니다.')
  async create(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: CreateSubTaskRequest
  ) {
    return await this.subTaskService.create(user.id, id, body.content, body.completed);
  }

  @Put(':id/labels')
  async updateLabels(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: UpdateLabelsRequest
  ) {
    return new BaseResponse(
      200,
      '태스크 라벨 수정 완료했습니다.',
      await this.taskService.updateLabels(user.id, id, body.labels)
    );
  }
}
