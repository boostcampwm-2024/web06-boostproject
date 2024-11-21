export class TaskEventResponse {
  taskId: number;

  taskEvent: string;

  static from(taskId: number) {
    const response = new TaskEventResponse();
    response.taskId = taskId;
    return response;
  }

  static of(taskId: number, taskEvent: string) {
    const response = new TaskEventResponse();
    response.taskId = taskId;
    response.taskEvent = taskEvent;
    return response;
  }
}
