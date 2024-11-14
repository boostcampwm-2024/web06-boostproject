import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTaskRequest {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsOptional()
  sectionId: number;
}
