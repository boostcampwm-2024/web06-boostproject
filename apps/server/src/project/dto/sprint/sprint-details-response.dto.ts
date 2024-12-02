import { Sprint } from '@/project/entity/sprint.entity';

export class SprintDetailsResponse {
  constructor(sprint: Sprint) {
    this.id = sprint.id;
    this.name = sprint.title;
    [this.startDate] = sprint.startDate.toISOString().split('T');
    [this.endDate] = sprint.endDate.toISOString().split('T');
  }

  id: number;

  name: string;

  startDate: string;

  endDate: string;
}
