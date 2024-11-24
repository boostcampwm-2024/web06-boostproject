import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from '@/project/service/project.service';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { CreateProjectRequest } from '@/project/dto/create-project-request.dto';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { InviteUserRequest } from '@/project/dto/invite-user-request.dto';
import { UpdateContributorRequest } from '@/project/dto/update-contributor-request.dts';
import { TaskEvent } from '@/task/dto/task-event.dto';
import { TaskService } from '@/task/service/task.service';
import { EventType } from '@/task/enum/eventType.enum';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';
import { BaseResponse } from '@/common/BaseResponse';
import { SprintService } from '@/project/service/sprint.service';
import { SprintDetailsRequest } from '@/project/dto/sprint-details-request.dto';
import { LabelService } from '@/project/service/label.service';
import { LabelDetailsRequest } from '@/project/dto/label-details-request.dto';

@UseGuards(AccessTokenGuard)
@Controller('project')
export class ProjectController {
  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private sprintService: SprintService,
    private labelService: LabelService
  ) {}

  @Get('invitations')
  @ResponseMessage('프로젝트 멤버 초대 목록 조회에 성공했습니다.')
  async getInvitations(@AuthUser() user: Account) {
    return await this.projectService.getInvitations(user.id);
  }

  @Get(':id')
  @ResponseMessage('프로젝트 상세 조회에 성공했습니다.')
  async getProject(@AuthUser() user: Account, @Param('id') projectId: number) {
    return await this.projectService.getProject(user.id, projectId);
  }

  @Get(':id/members')
  @ResponseMessage('프로젝트 멤버 목록 조회에 성공했습니다.')
  async getMembers(@AuthUser() user: Account, @Param('id') projectId: number) {
    return await this.projectService.getContributors(user.id, projectId);
  }

  @Post()
  @ResponseMessage('프로젝트 생성이 성공했습니다.')
  async create(@AuthUser() user: Account, @Body() body: CreateProjectRequest) {
    return await this.projectService.create(user.id, body.title);
  }

  @Post(':id/invite')
  @ResponseMessage('프로젝트 멤버 초대가 성공했습니다.')
  async invite(
    @AuthUser() user: Account,
    @Param('id') projectId: number,
    @Body() body: InviteUserRequest
  ) {
    await this.projectService.invite(user.id, projectId, body.username);
    return {
      message: 'Successfully invite user',
      success: true,
    };
  }

  @Patch(':id/invite')
  @ResponseMessage('프로젝트 멤버 초대 처리가 성공했습니다.')
  async updateInvitation(
    @AuthUser() user: Account,
    @Param('id') projectId: number,
    @Body() body: UpdateContributorRequest
  ) {
    await this.projectService.updateInvitation(user.id, projectId, body.contributorId, body.status);
    return {
      message: 'Successfully update invitation',
      success: true,
    };
  }

  @Post(':id/update')
  @ResponseMessage('이벤트 처리 완료했습니다.')
  async handleEvent(
    @AuthUser() user: Account,
    @Param('id') projectId: number,
    @Body() taskEvent: TaskEvent
  ) {
    const { event } = taskEvent;
    let response;
    switch (event) {
      case EventType.CREATE_TASK:
        response = await this.taskService.create(user.id, projectId, taskEvent);
        break;
      case EventType.DELETE_TASK:
        response = await this.taskService.delete(user.id, projectId, taskEvent);
        break;
      case EventType.UPDATE_POSITION:
        response = await this.taskService.move(user.id, projectId, taskEvent);
        break;
      case EventType.INSERT_TITLE:
      case EventType.DELETE_TITLE:
        response = await this.taskService.enqueue(user.id, projectId, taskEvent);
        break;
      default:
        throw new BadRequestException('올바르지 않은 이벤트 타입입니다.');
    }
    return response;
  }

  @Post(':id/sprint')
  async createSprint(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: SprintDetailsRequest
  ) {
    return new BaseResponse(
      201,
      '스프린트 생성 완료했습니다.',
      await this.sprintService.create(user.id, id, body.name, body.startDate, body.endDate)
    );
  }

  @Get(':id/sprints')
  @HttpCode(200)
  async getSprints(@AuthUser() user: Account, @Param('id') id: number) {
    return new BaseResponse(
      200,
      '스프린트 목록 조회에 성공했습니다.',
      await this.sprintService.getAll(user.id, id)
    );
  }

  @Post(':id/label')
  async createLabel(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: LabelDetailsRequest
  ) {
    return new BaseResponse(
      201,
      '라벨 생성 완료했습니다.',
      await this.labelService.create(user.id, id, body.name, body.description, body.color)
    );
  }

  @Get(':id/labels')
  @HttpCode(200)
  async getLabels(@AuthUser() user: Account, @Param('id') id: number) {
    return new BaseResponse(
      200,
      '라벨 목록 조회에 성공했습니다.',
      await this.labelService.getAll(user.id, id)
    );
  }
}
