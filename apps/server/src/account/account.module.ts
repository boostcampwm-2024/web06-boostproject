import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from '@/account/controller/account.controller';
import { AccountService } from '@/account/service/account.service';
import { AccessTokenStrategy } from '@/account/strategy/accessToken.strategy';
import { RefreshTokenStrategy } from '@/account/strategy/refreshToken.strategy';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { RefreshTokenGuard } from '@/account/guard/refreshToken.guard';
import { AuthService } from '@/account/service/auth.service';
import { Account } from '@/account/entity/account.entity';

@Module({
  imports: [JwtModule.register({ global: true }), TypeOrmModule.forFeature([Account])],
  controllers: [AccountController],
  providers: [
    AccountService,
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
  exports: [AccessTokenGuard],
})
export class AccountModule {}
