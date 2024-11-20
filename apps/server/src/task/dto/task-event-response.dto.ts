export class TaskEventResponse {
  taskId: number;

  static from(taskId: number) {
    const response = new TaskEventResponse();
    response.taskId = taskId;
    return response;
  }
}
