import { BaseResponse, Label, User } from '@/features/types.ts';

export type GetMembersResponse = BaseResponse<User[]>;

export type GetLabelsResponse = BaseResponse<Label[]>;

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
