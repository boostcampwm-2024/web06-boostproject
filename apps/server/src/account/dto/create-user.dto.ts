import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 15)
  @Matches(/^\S+$/, { message: '공백은 사용 불가합니다.' })
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 15)
  @Matches(/^\S+$/, { message: '공백은 사용 불가합니다.' })
  password: string;
}
