import { IsNotEmpty, IsNumber, IsPositive, Length } from 'class-validator';

export class InviteUserRequest {
  @IsNotEmpty()
  @Length(6, 15)
  username: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  projectId: number;
}
