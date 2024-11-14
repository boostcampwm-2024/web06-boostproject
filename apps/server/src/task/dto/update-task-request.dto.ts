import { IsNumber, IsString } from 'class-validator';

export class UpdateTaskRequest {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  sectionId: number;
}
