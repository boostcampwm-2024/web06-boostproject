import { Body, Controller, Delete, Param, Patch, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { SprintService } from '@/project/service/sprint.service';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { SprintDetailsRequest } from '@/project/dto/sprint-details-request.dto';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';

@UseGuards(AccessTokenGuard)
@Controller('sprint')
export class SprintController {
  constructor(private sprintService: SprintService) {}

  @Patch(':id')
  @ResponseMessage('스프린트 상세 정보 수정 완료했습니다.')
  async update(
    @AuthUser() user: Account,
    @Param('id') id: number,
    @Body() body: SprintDetailsRequest
  ) {
    body.validateDuration();
    return this.sprintService.update(user.id, id, body.name, body.startDate, body.endDate);
  }

  @Delete(':id')
  @ResponseMessage('스프린트 삭제 완료했습니다.')
  async delete(@AuthUser() user: Account, @Param('id') id: number) {
    return this.sprintService.delete(user.id, id);
  }
}
