export interface Project {
  id: number;
  title: string;
  createdAt: string;
  role: string;
}

export interface GetProjectsResponseDTO {
  status: number;
  message: string;
  result: Project[];
}

export interface CreateProjectRequestDTO {
  title: string;
}

export interface ProjectMember {
  id: number;
  username: string;
  role: string;
}

export interface GetProjectMembersResponseDTO {
  status: number;
  message: string;
  result: ProjectMember[];
}

export interface InviteProjectMemberRequestDTO {
  username: string;
  projectId: number;
}

export interface ProjectInvitation {
  contributorId: number;
  projectId: number;
  projectTitle: string;
  inviter: string;
}

export interface GetProjectInvitationsResponseDTO {
  status: number;
  message: string;
  result: ProjectInvitation[];
}

export interface HandleProjectInvitationRequestDTO {
  contributorId: number;
  status: 'ACCEPTED' | 'REJECTED';
}
