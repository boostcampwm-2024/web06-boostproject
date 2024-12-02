import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EntityTimestamp } from '@/common/entity-timestamp.entity';

@Entity()
export class TaskLabel extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectId: number;

  @Column()
  taskId: number;

  @Column()
  labelId: number;
}
