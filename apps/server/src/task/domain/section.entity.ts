import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '@/project/entity/project.entity';

@Entity()
export class Section {
  @PrimaryGeneratedColumn()
  id: number;

<<<<<<< HEAD
	@Column()
	name: string;

	@ManyToOne(() => Project)
	@JoinColumn({ name: 'project_id' })
	project: Project;
=======
  @Column()
  name: string;
>>>>>>> 7679844a70608707288d38f187371a9580eafb79
}
