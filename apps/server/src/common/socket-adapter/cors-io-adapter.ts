import { IoAdapter } from '@nestjs/platform-socket.io';
import { Injectable } from '@nestjs/common';
import { ServerOptions } from 'socket.io';

@Injectable()
export class CorsIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const corsOptions = {
      origin: ['http://boost-harmony.kro.kr'],
      methods: ['GET', 'POST'],
      credentials: true,
    };

    const customOptions = { ...options, cors: corsOptions };
    const server = super.createIOServer(port, customOptions);
    return server;
  }
}
