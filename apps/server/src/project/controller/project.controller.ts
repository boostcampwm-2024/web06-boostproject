import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { CreateProjectRequest } from '../dto/create-project-request.dto';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';

@UseGuards(AccessTokenGuard)
@Controller('projects')
export class ProjectController {
	constructor(private projectService: ProjectService) {}

	@Get()
	getProjects(@AuthUser() user: Account) {
		return this.projectService.getUserProjects(user.id);
	}

	@Post()
	create(@AuthUser() user: Account, @Body() body: CreateProjectRequest) {
		return this.projectService.create(user.id, body.title);
	}
}
