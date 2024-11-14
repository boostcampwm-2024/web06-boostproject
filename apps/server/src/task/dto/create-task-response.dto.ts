import { Task } from '@/task/domain/task.entity';

export class CreateTaskResponse {
  constructor(task: Task) {
    this.id = task.id;
    this.position = task.position;
  }

  id: number;

  position: string;
}
