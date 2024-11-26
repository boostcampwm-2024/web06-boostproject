import { JwtService } from '@nestjs/jwt';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '@/account/entity/account.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async signUp(username: string, password: string) {
    const account = await this.accountRepository.findOneBy({ username });
    if (account) {
      throw new ConflictException('Already used username');
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await this.accountRepository.save({ username, password: hash });
    return user;
  }

  async signIn(username: string, password: string) {
    const user = await this.validateUser(username, password);
    const payload = { id: user.id, username: user.username };
    const accessToken = await this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    const hashRefreshToken = await bcrypt.hash(refreshToken, 10);
    user.setRefreshToken(hashRefreshToken);
    await this.accountRepository.save(user);
    return { user, accessToken, refreshToken };
  }

  async signOut(user: Account) {
    user.setRefreshToken(null);
    await this.accountRepository.save(user);
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
    return accessToken;
  }

  private async validateUser(username: string, password: string) {
    const account = await this.accountRepository.findOneBy({ username });
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
