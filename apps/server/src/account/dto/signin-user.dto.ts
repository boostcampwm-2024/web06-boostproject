import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SigninUserDto {
  @IsNotEmpty({ message: '유저네임을 입력해주세요.' })
  @IsString()
  @Matches(/^\S+$/, { message: '공백은 사용 불가합니다.' })
  username: string;

  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @IsString()
  @Matches(/^\S+$/, { message: '공백은 사용 불가합니다.' })
  password: string;
}
