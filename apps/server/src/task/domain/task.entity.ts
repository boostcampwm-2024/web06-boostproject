import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Section } from '@/task/domain/section.entity';
import { EntityTimestamp } from '@/common/entity-timestamp.entity';

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

  @ManyToOne(() => Section)
  @JoinColumn({ name: 'section_id' })
  section: Section;
}
