import { UpdateTaskDetailsRequest } from '@/task/dto/update-task-details-request.dto';

export class UpdateTaskDetailsResponse {
  constructor(taskId: number, request: UpdateTaskDetailsRequest) {
    this.taskId = taskId;
    this.description = request.description;
    this.priority = request.priority;
    this.sprintId = request.sprintId;
    this.estimate = request.estimate;
  }

  taskId: number;

  description: string;

  priority: number;

  sprintId: number;

  estimate: number;
}
