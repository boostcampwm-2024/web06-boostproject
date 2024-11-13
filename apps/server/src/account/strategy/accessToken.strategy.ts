import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccountService } from '../service/account.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'access_token') {
  constructor(
    private readonly accountService: AccountService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const user = await this.accountService.findById(payload.id);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid access token');
    }
    return user;
  }
}
