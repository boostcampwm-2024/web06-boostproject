import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TaskService } from '@/task/service/task.service';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';
import { UpdateTaskDetailsRequest } from '@/task/dto/update-task-details-request.dto';
import { SubTaskService } from '@/task/service/subTask.service';
import { CreateSubTaskRequest } from '@/task/dto/create-subTask-request.dto';
import { UpdateLabelsRequest } from '@/task/dto/update-labels-request.dto';
import { UpdateAssigneesRequest } from '@/task/dto/update-assignees-request.dto';
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
  async getAll(@AuthUser() user: Account, @Query('projectId') projectId: number) {
    return this.taskService.getAll(user.id, projectId);
  }

  @Get(':id')
  @ResponseMessage('태스크가 정상적으로 조회되었습니다.')
  async get(@AuthUser() user: Account, @Param('id') id: number) {
    return this.taskService.get(user.id, id);
  }

  @Patch(':id')
  @ResponseMessage('태스크 상세 정보 수정 완료했습니다.')
  async updateDetails(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: UpdateTaskDetailsRequest
  ) {
    return this.taskService.updateDetails(user.id, id, body);
  }

  @Post(':id/subtask')
  @ResponseStatus(201)
  @ResponseMessage('서브 태스크 생성 완료했습니다.')
  async create(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: CreateSubTaskRequest
  ) {
    return this.subTaskService.create(user.id, id, body.content, body.completed);
  }

  @Put(':id/labels')
  @ResponseMessage('태스크 라벨 수정 완료했습니다.')
  async updateLabels(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: UpdateLabelsRequest
  ) {
    return this.taskService.updateLabels(user.id, id, body.labels);
  }

  @Put(':id/assignees')
  @ResponseMessage('태스크 담당자 수정 완료했습니다.')
  async updateAssignees(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: UpdateAssigneesRequest
  ) {
    return this.taskService.updateAssignees(user.id, id, body.assignees);
  }
}
