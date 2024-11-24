import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EntityTimestamp } from '@/common/entity-timestamp.entity';

@Entity()
export class TaskAssignee extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taskId: number;

  @Column()
  accountId: number;
}
