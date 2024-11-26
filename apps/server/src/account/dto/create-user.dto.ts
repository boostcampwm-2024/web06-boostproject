import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Length(6, 15)
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 15)
  password: string;
}
