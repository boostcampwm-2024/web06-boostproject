import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from '@/app.module';
import { CustomIoAdapter } from './common/custom-io-adapter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new CustomIoAdapter(app));
  await app.listen(3000);
}
bootstrap();
