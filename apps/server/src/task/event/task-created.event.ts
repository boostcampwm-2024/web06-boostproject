import { LabelDetailsResponse } from '@/project/dto/label-details-response.dto';
import { AssigneeDetailsResponse } from '@/task/dto/assignee-details-response.dto';
import { Task } from '@/task/domain/task.entity';

export class TaskCreatedEvent {
  constructor(task: Task) {
    this.id = task.id;
    this.title = task.title;
    this.sectionId = task.section.id;
    this.position = task.position;
    this.assignees = [];
    this.labels = [];
    this.subtasks = { total: 0, completed: 0 };
  }

  id: number;

  title: string;

  sectionId: number;

  position: string;

  assignees: AssigneeDetailsResponse[];

  labels: LabelDetailsResponse[];

  subtasks: { total: number; completed: number };
}
