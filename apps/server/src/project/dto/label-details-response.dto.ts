import { Label } from '@/project/entity/label.entity';

export class LabelDetailsResponse {
  constructor(label: Label) {
    this.id = label.id;
    this.name = label.title;
    this.description = label.description;
    this.color = label.color;
  }

  id: number;

  name: string;

  description: string;

  color: string;
}
