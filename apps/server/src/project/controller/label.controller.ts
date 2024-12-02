import { Body, Controller, Delete, Param, Patch, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { LabelService } from '@/project/service/label.service';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { LabelDetailsRequest } from '@/project/dto/label/label-details-request.dto';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';

@UseGuards(AccessTokenGuard)
@Controller('label')
export class LabelController {
  constructor(private labelService: LabelService) {}

  @Patch(':id')
  @ResponseMessage('라벨 상세 정보 수정 완료했습니다.')
  update(@AuthUser() user: Account, @Param('id') id: number, @Body() body: LabelDetailsRequest) {
    return this.labelService.update(user.id, id, body.name, body.description, body.color);
  }

  @Delete(':id')
  @ResponseMessage('라벨 삭제 완료했습니다.')
  delete(@AuthUser() user: Account, @Param('id') id: number) {
    return this.labelService.delete(user.id, id);
  }
}
