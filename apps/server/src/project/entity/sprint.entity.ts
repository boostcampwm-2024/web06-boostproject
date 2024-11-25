import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EntityTimestamp } from '@/common/entity-timestamp.entity';

@Entity()
export class Sprint extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectId: number;

  @Column()
  title: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  update(title: string, startDate: string, endDate: string) {
    if (title) {
      this.title = title;
    }
    if (startDate && endDate) {
      this.startDate = new Date(startDate);
      this.endDate = new Date(endDate);
    }
  }
}
