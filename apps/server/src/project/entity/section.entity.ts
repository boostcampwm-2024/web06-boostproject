import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '@/project/entity/project.entity';
import { EntityTimestamp } from '@/common/entity-timestamp.entity';

@Entity()
export class Section extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
