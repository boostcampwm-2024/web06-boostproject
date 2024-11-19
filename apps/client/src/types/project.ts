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
