import { Body, Controller, Headers, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../service/auth.service';
import { RefreshTokenGuard } from '../guard/refreshToken.guard';
import { AuthUser } from '../decorator/authUser.decorator';
import { Account } from '../entity/account.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserDto } from '../dto/user.dto';

@Controller('auth')
export class AccountController {
	constructor(private readonly authService: AuthService) {}

	@Post('signup')
	async signUp(@Body() body: CreateUserDto) {
		const user = await this.authService.signUp(body.username, body.password);
		return new UserDto(user);
	}

	@Post('signin')
	async signIn(@Body() body: CreateUserDto, @Res({ passthrough: true }) res: Response) {
		const signInResult = await this.authService.signIn(body.username, body.password);
		res.setHeader('authorization', `Bearer ${signInResult.accessToken}`);
		res.setHeader('x-refresh-token', signInResult.refreshToken);
		return new UserDto(signInResult.user);
	}

	@UseGuards(RefreshTokenGuard)
	@Post('refresh')
	async refresh(
		@AuthUser() user: Account,
		@Headers('x-refresh-token') refreshToken: string,
		@Res({ passthrough: true }) res: Response
	) {
		const tokens = await this.authService.refresh(user, refreshToken);
		res.setHeader('Authorization', `Bearer ${tokens.accessToken}`);
		return new UserDto(user);
	}

	@UseGuards(RefreshTokenGuard)
	@Post('signout')
	async signOut(@AuthUser() user: Account) {
		this.authService.signOut(user);
		return { message: 'Successfully sign out', success: true };
	}
}
