import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSubTaskRequest {
  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsBoolean()
  completed: boolean;
}
