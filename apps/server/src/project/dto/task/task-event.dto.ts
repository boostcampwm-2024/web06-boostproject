import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsEnum,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventType } from '@/project/enum/eventType.enum';
import { UpdateInformation } from '@/project/dto/task/update-information.type';

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
