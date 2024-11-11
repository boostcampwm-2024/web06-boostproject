import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
	@IsNotEmpty()
	@IsEmail()
	username: string;

	@IsNotEmpty()
	@IsString()
	@Length(8, 15)
	password: string;
}
