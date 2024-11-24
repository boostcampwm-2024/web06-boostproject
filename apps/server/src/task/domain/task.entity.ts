import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Section } from '@/task/domain/section.entity';
import { EntityTimestamp } from '@/common/entity-timestamp.entity';
import { UpdateTaskDetailsRequest } from '@/task/dto/update-task-details-request.dto';

@Entity()
export class Task extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  title: string;

  @Column({ default: '' })
  description: string;

  @Column()
  position: string;

  @Column({ nullable: true })
  priority: number;

  @Column({ nullable: true })
  sprintId: number;

  @Column({ nullable: true })
  estimate: number;

  @ManyToOne(() => Section)
  @JoinColumn({ name: 'section_id' })
  section: Section;

  updateDetails(body: UpdateTaskDetailsRequest) {
    if (body.description) {
      this.description = body.description;
    }
    if (body.priority || body.priority === null) {
      this.priority = body.priority;
    }
    if (body.sprintId || body.sprintId === null) {
      this.sprintId = body.sprintId;
    }
    if (body.estimate || body.estimate === null) {
      this.estimate = body.estimate;
    }
  }
}
