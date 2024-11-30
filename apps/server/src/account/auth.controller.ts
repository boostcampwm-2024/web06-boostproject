import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '@/account/auth.service';
import { RefreshTokenGuard } from '@/account/guard/refreshToken.guard';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { CreateUserDto } from '@/account/dto/create-user.dto';
import { UserDto } from '@/account/dto/user.dto';
import { AuthDto } from '@/account/dto/auth.dto';
import { AccessTokenGuard } from '@/account/guard/accessToken.guard';
import { ResponseMessage } from '@/common/decorator/response-message.decorator';
import { ResponseStatus } from '@/common/decorator/response-status.decorator';
import { SigninUserDto } from '@/account/dto/signin-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ResponseStatus(201)
  @ResponseMessage('회원가입 처리가 완료되었습니다.')
  async signUp(@Body() body: CreateUserDto) {
    const user = await this.authService.signUp(body.username, body.password);
    return new UserDto(user);
  }

  @Post('signin')
  @ResponseMessage('로그인 처리가 완료되었습니다.')
  async signIn(@Body() body: SigninUserDto, @Res({ passthrough: true }) res: Response) {
    const signInResult = await this.authService.signIn(body.username, body.password);
    res.cookie('refreshToken', signInResult.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
    });
    return AuthDto.of(signInResult.accessToken, signInResult.user);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @ResponseMessage('토큰 재발급 처리가 완료되었습니다.')
  async refresh(@AuthUser() user: Account, @Req() req: Request) {
    const { refreshToken } = req.cookies;
    const accessToken = await this.authService.refresh(user, refreshToken);
    return AuthDto.of(accessToken, user);
  }

  @UseGuards(AccessTokenGuard)
  @Post('signout')
  @ResponseMessage('로그아웃 처리가 완료되었습니다.')
  async signOut(@AuthUser() user: Account, @Res({ passthrough: true }) res: Response) {
    this.authService.signOut(user);
    res.cookie('refreshToken', '', {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(0),
    });
  }
}
