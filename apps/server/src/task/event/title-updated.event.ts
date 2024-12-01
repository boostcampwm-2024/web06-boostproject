export class TitleUpdatedEvent {
  constructor(taskId: number, position: number, content: string, length: number) {
    this.id = taskId;
    this.title = { position, content, length };
  }

  id: number;

  title: { position: number; content: string; length: number };
}
