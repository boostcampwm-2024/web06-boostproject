import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { ServerOptions } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

export class AuthenticatedIoAdapter extends IoAdapter {
  constructor(private app: INestApplication) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options);

    server.use((socket, next) => {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new UnauthorizedException('Token not provided'));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.data.user = decoded;
        next();
      } catch (err) {
        next(new UnauthorizedException('Invalid token'));
      }
    });

    return server;
  }
}
