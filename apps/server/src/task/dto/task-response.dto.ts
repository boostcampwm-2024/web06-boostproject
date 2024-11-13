import { Task } from '../domain/task.entity';

export class TaskResponse {
  constructor(task: Task) {
    this.id = task.id;
    this.title = task.title;
    this.description = task.description;
    this.sectionName = task.section.name;
    this.position = task.position;
  }

  id: number;

  title: string;

  description: string;

  sectionName: string;

  position: string;
}
