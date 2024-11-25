export type Assignee = {
  id: number;
  username: string;
  avatar: string; // or imageUrl
};

export type Label = {
  id: number;
  name: string;
  description: string;
  color: string;
};

export type Priority = number;

export type Sprint = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
};

export type Estimate = number;
