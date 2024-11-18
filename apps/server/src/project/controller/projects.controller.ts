import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProjectService } from '@/project/service/project.service';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { BaseResponse } from '@/common/BaseResponse';

@UseGuards(AccessTokenGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectService: ProjectService) {}

  @Get()
  async getProjects(@AuthUser() user: Account) {
    return new BaseResponse(
      200,
      '프로젝트 목록 조회에 성공했습니다.',
      await this.projectService.getUserProjects(user.id)
    );
  }
}
