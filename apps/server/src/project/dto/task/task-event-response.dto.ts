import { EventType } from '@/project/enum/eventType.enum';

export class TaskEventResponse {
  constructor(eventTitle: EventType, event: any) {
    const now = new Date();
    this.event = eventTitle;
    this.version = now.getTime();
    this.task = event;
  }

  event: EventType;

  version: number;

  task: any;
}
