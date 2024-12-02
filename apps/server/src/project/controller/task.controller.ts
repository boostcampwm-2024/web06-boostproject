import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from '@/project/service/task.service';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';
import { UpdateTaskDetailsRequest } from '@/project/dto/task/update-task-details-request.dto';
import { SubTaskService } from '@/project/service/subTask.service';
import { CreateSubTaskRequest } from '@/project/dto/subtask/create-subTask-request.dto';
import { UpdateLabelsRequest } from '@/project/dto/label/update-labels-request.dto';
import { UpdateAssigneesRequest } from '@/project/dto/assignee/update-assignees-request.dto';
import { ResponseStatus } from '@/common/decorator/response-status.decorator';

@UseGuards(AccessTokenGuard)
@Controller('task')
export class TaskController {
  constructor(
    private taskService: TaskService,
    private subTaskService: SubTaskService
  ) {}

  @Get()
  @ResponseMessage('태스크 목록이 정상적으로 조회되었습니다.')
  getAll(@AuthUser() user: Account, @Query('projectId') projectId: number) {
    return this.taskService.getAll(user.id, projectId);
  }

  @Get(':id')
  @ResponseMessage('태스크가 정상적으로 조회되었습니다.')
  get(@AuthUser() user: Account, @Param('id') id: number) {
    return this.taskService.get(user.id, id);
  }

  @Get(':id/detail')
  @ResponseMessage('태스크 상세 정보 조회 완료했습니다.')
  getTaskDetail(@AuthUser() user: Account, @Param('id') id: number) {
    return this.taskService.getTaskDetail(user.id, id);
  }

  @Patch(':id')
  @ResponseMessage('태스크 상세 정보 수정 완료했습니다.')
  updateDetails(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: UpdateTaskDetailsRequest
  ) {
    return this.taskService.updateDetails(user.id, id, body);
  }

  @Post(':id/subtask')
  @ResponseStatus(201)
  @ResponseMessage('서브 태스크 생성 완료했습니다.')
  create(@AuthUser() user: Account, @Param('id') id: number, @Body() body: CreateSubTaskRequest) {
    return this.subTaskService.create(user.id, id, body.content, body.completed);
  }

  @Put(':id/labels')
  @ResponseMessage('태스크 라벨 수정 완료했습니다.')
  updateLabels(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: UpdateLabelsRequest
  ) {
    return this.taskService.updateLabels(user.id, id, body.labels);
  }

  @Put(':id/assignees')
  @ResponseMessage('태스크 담당자 수정 완료했습니다.')
  updateAssignees(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: UpdateAssigneesRequest
  ) {
    return this.taskService.updateAssignees(user.id, id, body.assignees);
  }

  @Delete(':id')
  @ResponseMessage('태스크 삭제 완료했습니다.')
  delete(@AuthUser() user: Account, @Param('id') id: number) {
    return this.taskService.deleteWithoutEvent(user.id, id);
  }
}
