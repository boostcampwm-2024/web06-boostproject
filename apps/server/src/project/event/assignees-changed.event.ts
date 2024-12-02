import { AssigneeDetailsResponse } from '@/project/dto/assignee/assignee-details-response.dto';

export class AssigneesChangedEvent {
  constructor(taskId: number, assignees: AssigneeDetailsResponse[]) {
    this.id = taskId;
    this.assignees = assignees;
  }

  id: number;

  assignees: AssigneeDetailsResponse[];
}
