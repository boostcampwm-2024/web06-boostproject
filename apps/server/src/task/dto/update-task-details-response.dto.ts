import { SprintDetailsResponse } from '@/project/dto/sprint-details-response.dto';
import { UpdateTaskDetailsRequest } from '@/task/dto/update-task-details-request.dto';

export class UpdateTaskDetailsResponse {
  constructor(
    taskId: number,
    request: UpdateTaskDetailsRequest,
    sprintDetails: SprintDetailsResponse
  ) {
    this.taskId = taskId;
    this.description = request.description;
    this.priority = request.priority;
    this.sprint = request.sprintId === null ? null : sprintDetails;
    this.estimate = request.estimate;
  }

  taskId: number;

  description: string;

  priority: number;

  sprint: SprintDetailsResponse;

  estimate: number;
}
