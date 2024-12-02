import { ContributorStatus } from '@/project/enum/contributor-status.enum';

export class ProjectContributorsResponse {
  id: number;

  username: string;

  role: ContributorStatus;

  constructor(id: number, username: string, role: ContributorStatus) {
    this.id = id;
    this.username = username;
    this.role = role;
  }
}
