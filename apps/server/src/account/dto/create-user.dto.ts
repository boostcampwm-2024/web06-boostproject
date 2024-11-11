import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
	@IsEmail()
	username: string;

	@IsString()
	@Length(8, 15)
	password: string;
}
