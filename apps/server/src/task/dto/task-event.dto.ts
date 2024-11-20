import { IsNumber, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { EventType } from '@/task/domain/eventType.enum';
import { UpdateInformation } from '@/task/domain/update-information.type';

export class TaskEvent {
  @IsNumber()
  taskId: number;

  @IsNumber()
  sectionId: number;

  @IsString()
  position: string;

  @IsNotEmpty()
  @IsEnum(EventType)
  event: EventType;

  title: UpdateInformation;
}
