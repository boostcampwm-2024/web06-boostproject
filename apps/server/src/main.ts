import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from '@/app.module';
import { CorsIoAdapter } from './common/socket-adapter/cors-io-adapter';
import { AuthenticatedIoAdapter } from './common/socket-adapter/authentication-io-adapter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new CorsIoAdapter(app));
  app.useWebSocketAdapter(new AuthenticatedIoAdapter(app));
  await app.listen(3000);
}
bootstrap();
