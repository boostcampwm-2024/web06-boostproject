export class UserInvitationResponse {
	contributorId: number;

	projectId: number;

	projectTitle: string;

	inviter: string;

	constructor(contributorId: number, projectId: number, projectTitle: string, inviter: string) {
		this.contributorId = contributorId;
		this.projectId = projectId;
		this.projectTitle = projectTitle;
		this.inviter = inviter;
	}
}
