import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AccountService } from './account.service';
import { Account } from '../entity/account.entity';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async signUp(username: string, password: string) {
    const account = await this.accountService.findByUsername(username);
    if (account) {
      throw new BadRequestException('Already used username');
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await this.accountService.create(username, hash);
    return user;
  }

  async signIn(username: string, password: string) {
    const user = await this.validateUser(username, password);
    const payload = { id: user.id, username: user.username };
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    const hashRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.accountService.setRefreshToken(user, hashRefreshToken);
    return { user, accessToken, refreshToken };
  }

  async signOut(user: Account) {
    await this.accountService.setRefreshToken(user, null);
  }

  async refresh(user: Account, refreshToken: string) {
    if (!user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const result = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!result) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const accessToken = await this.generateAccessToken({ id: user.id, username: user.username });
    return { accessToken, refreshToken };
  }

  private async validateUser(username: string, password: string) {
    const account = await this.accountService.findByUsername(username);
    if (!account) {
      throw new UnauthorizedException('Does not found user by username');
    }
    const result = await bcrypt.compare(password, account.password);
    if (!result) {
      throw new UnauthorizedException('Invalid password');
    }
    return account;
  }

  private generateAccessToken(payload: { id: number; username: string }) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_TIME'),
    });
  }

  private generateRefreshToken(payload: { id: number; username: string }) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_TIME'),
    });
  }
}
