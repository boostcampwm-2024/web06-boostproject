import { ContributorStatus } from '../enum/contributor-status.enum';

export class UserProjectsResponse {
  role: ContributorStatus;

  project: { id: number; title: string; createdAt: Date };

  constructor(role: ContributorStatus, project: { id: number; title: string; createdAt: Date }) {
    this.role = role;
    this.project = project;
  }
}
