import { Controller, Get, Query } from '@nestjs/common';
import { ImageService } from '@/image/service/image.service';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('presigned-url')
  @ResponseMessage('Presigned URL이 성공적으로 생성되었습니다.')
  async getUploadUrl(@Query('name') name: string) {
    return { presignedUrl: await this.imageService.getUploadUrl(name) };
  }
}
