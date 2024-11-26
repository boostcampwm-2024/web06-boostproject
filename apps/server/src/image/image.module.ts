import { Module } from '@nestjs/common';
import { ImageController } from './controller/image.controller';
import { ImageService } from './service/image.service';

@Module({
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
