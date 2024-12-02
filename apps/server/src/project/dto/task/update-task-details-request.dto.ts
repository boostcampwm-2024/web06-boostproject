import { IsOptional, IsPositive, IsString, ValidateIf } from 'class-validator';

export class UpdateTaskDetailsRequest {
  @ValidateIf((dto) => dto.priority !== null)
  @IsOptional()
  @IsPositive()
  priority: number;

  @ValidateIf((dto) => dto.priority !== null)
  @IsOptional()
  @IsPositive()
  sprintId: number;

  @ValidateIf((dto) => dto.priority !== null)
  @IsOptional()
  @IsPositive()
  estimate: number;

  @IsOptional()
  @IsString()
  description: string;
}
