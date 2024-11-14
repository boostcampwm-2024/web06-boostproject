import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTaskRequest {
  @IsNumber()
  @IsNotEmpty()
  projectId: number;

  @IsString()
  @IsNotEmpty()
  lastTaskPosition: string;
}
