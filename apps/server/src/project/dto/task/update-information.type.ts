import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateInformation {
  @IsOptional()
  @IsNumber()
  position: number;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  length: number;
}
