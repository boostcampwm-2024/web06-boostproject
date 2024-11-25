import { Body, Controller, Delete, Param, Patch, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { SprintService } from '@/project/service/sprint.service';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { BaseResponse } from '@/common/BaseResponse';
import { SprintDetailsRequest } from '@/project/dto/sprint-details-request.dto';

@UseGuards(AccessTokenGuard)
@Controller('sprint')
export class SprintController {
  constructor(private sprintService: SprintService) {}

  @Patch(':id')
  async update(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: SprintDetailsRequest
  ) {
    body.validateDuration();
    return new BaseResponse(
      200,
      '스프린트 상세 정보 수정 완료했습니다.',
      await this.sprintService.update(user.id, id, body.name, body.startDate, body.endDate)
    );
  }

  @Delete(':id')
  async delete(@AuthUser() user: Account, @Param('id') id: number) {
    await this.sprintService.delete(user.id, id);
    return new BaseResponse(200, '스프린트 삭제 완료했습니다.', {});
  }
}
