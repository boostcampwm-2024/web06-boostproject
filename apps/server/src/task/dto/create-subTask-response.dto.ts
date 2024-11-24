import { SubTask } from '@/task/domain/subTask.entity';
import { SubTaskStatus } from '@/task/enum/subTaskStatus.enum';

export class CreateSubTaskResponse {
  constructor(subTask: SubTask) {
    this.id = subTask.id;
    this.content = subTask.content;
    this.completed = subTask.status === SubTaskStatus.COMPLETED;
  }

  id: number;

  content: string;

  completed: boolean;
}
