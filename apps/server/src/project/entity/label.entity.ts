import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EntityTimestamp } from '@/common/entity-timestamp.entity';

@Entity()
export class Label extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectId: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  color: string;

  update(title: string, description: string, color: string) {
    this.title = title;
    this.description = description;
    this.color = color;
  }
}
