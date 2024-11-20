import { EventType } from '@/task/domain/eventType.enum';
import { TaskEvent } from '@/task/dto/task-event.dto';

export class TaskEventResponse {
  taskId: number;

  event: EventType;

  constructor(taskEvent: TaskEvent) {
    this.taskId = taskEvent.taskId;
    this.event = taskEvent.event;
  }
}
