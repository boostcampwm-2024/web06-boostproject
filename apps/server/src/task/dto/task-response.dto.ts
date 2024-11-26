import { Task } from '@/task/domain/task.entity';
import { AssigneeDetailsResponse } from '@/task/dto/assignee-details-response.dto';
import { LabelDetailsResponse } from '@/project/dto/label-details-response.dto';

export class TaskResponse {
  constructor(
    task: Task,
    assigneeDetails: AssigneeDetailsResponse[],
    labelDetails: LabelDetailsResponse[]
  ) {
    this.id = task.id;
    this.title = task.title;
    this.description = task.description;
    this.sectionId = task.section.id;
    this.position = task.position;
    this.assignees = assigneeDetails;
    this.labels = labelDetails;
  }

  id: number;

  title: string;

  description: string;

  sectionId: number;

  position: string;

  assignees: AssigneeDetailsResponse[];

  labels: LabelDetailsResponse[];
}
