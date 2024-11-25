export interface BaseResponse<T = void> {
  status: number;
  message: string;
  result: T extends void ? never : T;
}

export type Sprint = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
};

export type Label = {
  id: number;
  name: string;
  description: string;
  color: string;
};

export type Assignee = {
  id: number;
  username: string;
  avatar: string; // or imageUrl
};
