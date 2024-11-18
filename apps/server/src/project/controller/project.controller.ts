import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { EventType } from '@/task/domain/eventType.enum';

@UseGuards(AccessTokenGuard)
@Controller('project')
export class ProjectController {
  constructor(
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  @Get(':id/members')
  getMembers(@AuthUser() user: Account, @Param('id') projectId: number) {
    return this.projectService.getContributors(user.id, projectId);
  }

  @Get('invitation')
  getInvitations(@AuthUser() user: Account) {
    return this.projectService.getInvitations(user.id);
  }

  @Post()
  create(@AuthUser() user: Account, @Body() body: CreateProjectRequest) {
    return this.projectService.create(user.id, body.title);
  }

  @Post('invitation')
  async invite(@AuthUser() user: Account, @Body() body: InviteUserRequest) {
    await this.projectService.invite(user.id, body.projectId, body.username);
    return { message: 'Successfully invite user', success: true };
  }

  @Patch('invitation')
  async updateInvitation(@AuthUser() user: Account, @Body() body: UpdateContributorRequest) {
    await this.projectService.updateInvitation(user.id, body.contributorId, body.status);
    return { message: 'Successfully update invitation', success: true };
  }

  @Post(':id/update')
  async handleEvent(@AuthUser() user: Account, @Body() taskEvent: TaskEvent) {
    const event = taskEvent.event;
    let response;
    switch (event) {
      case EventType.CREATE_TASK:
        // response = await this.taskService.create(user.id, taskEvent);
        break;
      case EventType.DELETE_TASK:
        // response = await this.taskService.delete(user.id, taskEvent);
        break;
      case EventType.UPDATE_POSITION:
        // response = await this.taskService.move(user.id, taskEvent);
        break;
      case EventType.INSERT_TITLE:
      case EventType.DELETE_TITLE:
        // response = await this.taskService.update(user.id, taskEvent);
        break;
      default:
        throw new BadRequestException('올바르지 않은 이벤트 타입입니다.');
    }
    return response;
  }
}
