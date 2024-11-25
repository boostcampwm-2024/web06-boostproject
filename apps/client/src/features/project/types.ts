export type Label = {
  id: number;
  name: string;
  description: string;
  color: string;
};

export interface GetLabelsResult {
  labels: Label[];
}

export interface CreateLabelDto {
  name: string;
  description: string;
  color: string;
}

export interface UpdateLabelDto {
  name?: string;
  description?: string;
  color?: string;
}

type Sprint = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
};

export interface GetSprintsResult {
  sprints: Sprint[];
}

export interface CreateSprintDto {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSprintDto {
  name?: string;
  startDate?: string;
  endDate?: string;
}
