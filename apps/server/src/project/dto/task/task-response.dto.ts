import { Task } from '@/project/entity/task.entity';
import { AssigneeDetailsResponse } from '@/project/dto/assignee/assignee-details-response.dto';
import { LabelDetailsResponse } from '@/project/dto/label/label-details-response.dto';

export class TaskResponse {
  constructor(
    task: Task,
    assigneeDetails: AssigneeDetailsResponse[],
    labelDetails: LabelDetailsResponse[],
    subtasks: { total: number; completed: number }
  ) {
    this.id = task.id;
    this.title = task.title;
    this.description = task.description;
    this.sectionId = task.section.id;
    this.position = task.position;
    this.assignees = assigneeDetails;
    this.labels = labelDetails;
    this.subtasks = subtasks;
  }

  id: number;

  title: string;

  description: string;

  sectionId: number;

  position: string;

  assignees: AssigneeDetailsResponse[];

  labels: LabelDetailsResponse[];

  subtasks: { total: number; completed: number };
}
