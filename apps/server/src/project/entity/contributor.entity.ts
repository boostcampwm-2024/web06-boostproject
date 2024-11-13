import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ContributorStatus } from '../enum/contributor-status.enum';
import { ProjectRole } from '../enum/project-role.enum';
import { EntityTimestamp } from '@/common/entity-timestamp.entity';

@Entity()
export class Contributor extends EntityTimestamp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  inviterId: number;

  @Column()
  projectId: number;

  @Column({ type: 'enum', enum: ContributorStatus })
  status: ContributorStatus;

  @Column({ type: 'enum', enum: ProjectRole })
  role: ProjectRole;
}
