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
