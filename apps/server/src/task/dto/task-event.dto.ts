import { IsNumber, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { EventType } from '../domain/eventType.enum';

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
