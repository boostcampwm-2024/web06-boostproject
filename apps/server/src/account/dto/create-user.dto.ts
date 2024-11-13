import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @Length(8, 15)
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 15)
  password: string;
}
