import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ContributorStatus } from '../enum/contributor-status.enum';
import { ProjectRole } from '../enum/project-role.enum';

@Entity()
export class Contributor {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	userId: number;

	@Column()
	projectId: number;

	@Column({ type: 'enum', enum: ContributorStatus })
	status: ContributorStatus;

	@Column({ type: 'enum', enum: ProjectRole })
	role: ProjectRole;
}
