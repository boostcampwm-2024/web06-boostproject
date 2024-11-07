import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Section {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;
}
