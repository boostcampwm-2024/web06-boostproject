import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProjectService } from '@/project/service/project.service';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';

@UseGuards(AccessTokenGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectService: ProjectService) {}

  @Get()
  @ResponseMessage('프로젝트 목록 조회에 성공했습니다.')
  async getProjects(@AuthUser() user: Account) {
    return await this.projectService.getUserProjects(user.id);
  }
}
