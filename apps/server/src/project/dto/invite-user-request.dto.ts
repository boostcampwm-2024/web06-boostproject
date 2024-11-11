import { IsEmail, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class InviteUserRequest {
	@IsNotEmpty()
	@IsEmail()
	username: string;

	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	projectId: number;
}
