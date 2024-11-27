import { LabelDetailsResponse } from '@/project/dto/label-details-response.dto';

export class LabelsChangedEvent {
  constructor(taskId: number, labels: LabelDetailsResponse[]) {
    this.id = taskId;
    this.labels = labels;
  }

  id: number;

  labels: LabelDetailsResponse[];
}
