import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EntityTimestamp } from '@/common/entity-timestamp.entity';

@Entity()
export class Project extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;
}
