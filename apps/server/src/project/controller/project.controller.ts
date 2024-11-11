import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { CreateProjectRequest } from '../dto/create-project-request.dto';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { InviteUserRequest } from '../dto/invite-user-request.dto';

@UseGuards(AccessTokenGuard)
@Controller('projects')
export class ProjectController {
	constructor(private projectService: ProjectService) {}

	@Get()
	getProjects(@AuthUser() user: Account) {
		return this.projectService.getUserProjects(user.id);
	}

	@Get(':id/members')
	getContributors(@AuthUser() user: Account, @Param('id') projectId: number) {
		return this.projectService.getContributors(user.id, projectId);
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
}
