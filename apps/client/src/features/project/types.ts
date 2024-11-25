import { BaseResponse, Label } from '@/features/types.ts';

export type User = {
  id: number;
  username: string;
  avatar: string;
};

export type Member = Omit<User, 'avatar'> & {
  role: string;
};

export type Assignee = User;

export type GetMembersResult = BaseResponse<User[]>;

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
