export class SubTaskChangedEvent {
  constructor(taskId: number, total: number, completed: number) {
    this.id = taskId;
    this.subtasks = { total, completed };
  }

  id: number;

  subtasks: { total: number; completed: number };
}
