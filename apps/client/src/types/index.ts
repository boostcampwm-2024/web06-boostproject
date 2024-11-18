export type TTask = {
  id: number;
  title: string;
  description: string;
  sectionName: string;
  position: string;
};

export type TSection = {
  id: number;
  name: string;
  tasks: TTask[];
};
