import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ProjectService } from '@/project/service/project.service';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { CreateProjectRequest } from '@/project/dto/create-project-request.dto';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { InviteUserRequest } from '@/project/dto/invite-user-request.dto';
import { UpdateContributorRequest } from '@/project/dto/update-contributor-request.dts';

@UseGuards(AccessTokenGuard)
@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

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
}
