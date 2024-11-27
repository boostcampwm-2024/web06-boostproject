export class TitleUpdatedEvent {
  constructor(taskId: number, title: string) {
    this.id = taskId;
    this.title = title;
  }

  id: number;

  title: string;
}
