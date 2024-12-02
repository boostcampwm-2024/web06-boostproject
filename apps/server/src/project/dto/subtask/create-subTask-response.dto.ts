import { SubTask } from '@/project/entity/subTask.entity';
import { SubTaskStatus } from '@/project/enum/subTaskStatus.enum';

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
