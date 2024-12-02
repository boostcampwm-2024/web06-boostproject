export class TaskDeletedEvent {
  constructor(taskId: number) {
    this.id = taskId;
  }

  id: number;
}
