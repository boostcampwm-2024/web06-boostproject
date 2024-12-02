import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSubTaskRequest {
  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  completed: boolean;
}
