import { EventType } from '@/task/enum/eventType.enum';

export class TaskEventResponse {
  constructor(eventTitle: EventType, event: any) {
    this.event = eventTitle;
    this.event = event;
  }

  event: EventType;

  task: any;
}
