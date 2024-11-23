export type Assignee = {
  id: number;
  username: string;
  avatar: string;
};

export type Label = {
  id: number;
  name: string;
  color: string;
};

export type Sprint = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
};

export type Estimate = number;
