import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '@/account/auth.service';
import { RefreshTokenGuard } from '@/account/guard/refreshToken.guard';
import { AuthUser } from '@/account/decorator/authUser.decorator';
import { Account } from '@/account/entity/account.entity';
import { CreateUserDto } from '@/account/dto/create-user.dto';
import { UserDto } from '@/account/dto/user.dto';
import { BaseResponse } from '@/common/BaseResponse';
import { AuthDto } from '@/account/dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: CreateUserDto) {
    const user = await this.authService.signUp(body.username, body.password);
    return new BaseResponse(201, '회원가입 처리가 완료되었습니다.', new UserDto(user));
  }

  @Post('signin')
  @HttpCode(200)
  async signIn(@Body() body: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    const signInResult = await this.authService.signIn(body.username, body.password);
    res.cookie('refreshToken', signInResult.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
    });
    return new BaseResponse(
      200,
      '로그인 처리가 완료되었습니다.',
      AuthDto.of(signInResult.accessToken, signInResult.user)
    );
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(200)
  async refresh(@AuthUser() user: Account, @Req() req: Request) {
    const { refreshToken } = req.cookies;
    const accessToken = await this.authService.refresh(user, refreshToken);
    return new BaseResponse(
      200,
      '토큰 재발급 처리가 완료되었습니다.',
      AuthDto.of(accessToken, user)
    );
  }

  @UseGuards(RefreshTokenGuard)
  @Post('signout')
  @HttpCode(200)
  async signOut(@AuthUser() user: Account, @Res({ passthrough: true }) res: Response) {
    this.authService.signOut(user);
    res.cookie('refreshToken', '', {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(0),
    });
    return new BaseResponse(200, '로그아웃 처리가 완료되었습니다.', {});
  }
}
