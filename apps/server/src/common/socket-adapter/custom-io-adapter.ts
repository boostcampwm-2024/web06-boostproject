import { IoAdapter } from '@nestjs/platform-socket.io';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ServerOptions } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const corsOptions = {
      origin: ['http://localhost:5173', 'https://boost-harmony.kro.kr'],
      methods: ['GET', 'POST'],
      credentials: true,
    };

    const customOptions = { ...options, cors: corsOptions };
    const server = super.createIOServer(port, customOptions);

    server.use((socket, next) => {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new UnauthorizedException('Token not provided'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        socket.data.user = decoded;
        next();
      } catch (err) {
        next(new UnauthorizedException('Invalid token'));
      }
    });

    return server;
  }
}
