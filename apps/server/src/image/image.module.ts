import { Module } from '@nestjs/common';
import { ImageController } from './controller/image.controller';
import { ImageService } from './service/image.service';
import { AccountModule } from '@/account/account.module';

@Module({
  controllers: [ImageController],
  providers: [ImageService],
  imports: [AccountModule],
})
export class ImageModule {}
