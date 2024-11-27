import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ImageService } from '@/image/service/image.service';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';
import { FileNameRequest } from '../dto/file-name-request.dto';
import { Account } from '@/account/entity/account.entity';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';

@Controller('image')
@UseGuards(AccessTokenGuard)
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('presigned-url')
  @ResponseMessage('Presigned URL이 성공적으로 생성되었습니다.')
  async getUploadUrl(@Body() fileNameRequest: FileNameRequest) {
    return await this.imageService.getUploadUrl(fileNameRequest.fileName);
  }

  @Get('access-url/:key')
  @ResponseMessage('이미지의 접근 URL이 성공적으로 조회되었습니다.')
  async getPublicUrl(@AuthUser() user: Account, @Param('key') key: string) {
    return await this.imageService.getAccessUrl(user.id, key);
  }
}
