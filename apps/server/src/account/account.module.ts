import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from '@/account/auth.controller';
import { AccessTokenStrategy } from '@/account/strategy/accessToken.strategy';
import { RefreshTokenStrategy } from '@/account/strategy/refreshToken.strategy';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { RefreshTokenGuard } from '@/account/guard/refreshToken.guard';
import { AuthService } from '@/account/auth.service';
import { Account } from '@/account/entity/account.entity';
import { UserService } from './user.service';

@Module({
  imports: [JwtModule.register({ global: true }), TypeOrmModule.forFeature([Account])],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
  exports: [AccessTokenGuard, UserService],
})
export class AccountModule {}
