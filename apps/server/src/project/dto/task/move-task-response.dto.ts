import { Task } from '@/project/entity/task.entity';

export class MoveTaskResponse {
  constructor(task: Task) {
    this.id = task.id;
    this.title = task.title;
    this.description = task.description;
    this.sectionId = task.section.id;
    this.position = task.position;
  }

  id: number;

  title: string;

  description: string;

  sectionId: number;

  position: string;
}
