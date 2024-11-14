import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MoveTaskRequest {
  @IsNumber()
  @IsNotEmpty()
  sectionId: number;

  @IsString()
  @IsNotEmpty()
  beforePosition: string;

  @IsString()
  @IsNotEmpty()
  afterPosition: string;
}
