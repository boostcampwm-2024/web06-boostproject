import { Project } from '@/project/entity/project.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Section {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@ManyToOne(() => Project)
	@JoinColumn({ name: 'project_id' })
	project: Project;
}
