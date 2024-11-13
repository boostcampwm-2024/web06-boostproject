import { IsNotEmpty, IsNumber, IsPositive, Length } from 'class-validator';

export class InviteUserRequest {
  @IsNotEmpty()
  @Length(8, 15)
  username: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  projectId: number;
}
