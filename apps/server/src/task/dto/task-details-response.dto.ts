import { Task } from '@/task/domain/task.entity';
import { SprintDetailsResponse } from '@/project/dto/sprint-details-response.dto';
import { AssigneeDetailsResponse } from '@/task/dto/assignee-details-response.dto';
import { LabelDetailsResponse } from '@/project/dto/label-details-response.dto';
import { CreateSubTaskResponse } from '@/task/dto/create-subTask-response.dto';

export class TaskDetailsResponse {
  id: number;

  title: string;

  description: string;

  priority: number;

  estimate: number;

  sprint: SprintDetailsResponse;

  assignees: AssigneeDetailsResponse[];

  labels: LabelDetailsResponse[];

  subtasks: CreateSubTaskResponse[];

  constructor(task: Task) {
    this.id = task.id;
    this.title = task.title;
    this.description = task.description;
    this.priority = task.priority;
    this.estimate = task.estimate;
  }

  setSprint(sprintDetails: SprintDetailsResponse) {
    this.sprint = sprintDetails;
  }

  setAssignees(assigneeDetails: AssigneeDetailsResponse[]) {
    this.assignees = assigneeDetails;
  }

  setLabels(labelDetails: LabelDetailsResponse[]) {
    this.labels = labelDetails;
  }

  setSubtasks(subtaskDetails: CreateSubTaskResponse[]) {
    this.subtasks = subtaskDetails;
  }
}
