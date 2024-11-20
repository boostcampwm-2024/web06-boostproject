import { EventType } from '@/task/domain/eventType.enum';
import { TaskEvent } from '@/task/dto/task-event.dto';

export class TaskEventResponse {
  taskId: number;

  event: EventType;

  static from(taskEvent: TaskEvent) {
    const response = new TaskEventResponse();
    response.taskId = taskEvent.taskId;
    response.event = taskEvent.event;
    return response;
  }

  static of(taskId: number, taskEvent: TaskEvent) {
    const response = new TaskEventResponse();
    response.taskId = taskId;
    response.event = taskEvent.event;
    return response;
  }
}
