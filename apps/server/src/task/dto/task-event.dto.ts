import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsEnum,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '@/task/domain/eventType.enum';
import { UpdateInformation } from '@/task/domain/update-information.type';

export class TaskEvent {
  @IsOptional()
  @IsNumber()
  taskId: number;

  @IsOptional()
  @IsNumber()
  sectionId: number;

  @IsOptional()
  @IsString()
  position: string;

  @IsNotEmpty()
  @IsEnum(EventType)
  event: EventType;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateInformation)
  title: UpdateInformation;
}
