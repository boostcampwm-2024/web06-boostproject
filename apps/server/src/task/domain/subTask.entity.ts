import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { SubTaskStatus } from '@/task/enum/subTaskStatus.enum';
import { EntityTimestamp } from '@/common/entity-timestamp.entity';

@Entity()
export class SubTask extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  taskId: number;

  @Column()
  content: string;

  @Column({ type: 'enum', enum: SubTaskStatus })
  status: SubTaskStatus;

  update(content: string, completed: boolean) {
    if (content) {
      this.content = content;
    }
    if (completed !== undefined) {
      this.status = completed ? SubTaskStatus.COMPLETED : SubTaskStatus.PENDING;
    }
  }
}
