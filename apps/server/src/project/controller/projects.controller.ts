import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProjectService } from '@/project/service/project.service';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';

@UseGuards(AccessTokenGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectService: ProjectService) {}

  @Get()
  getProjects(@AuthUser() user: Account) {
    return this.projectService.getUserProjects(user.id);
  }
}
