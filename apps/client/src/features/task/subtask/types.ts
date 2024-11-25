export type Subtask = {
  id: number;
  content: string;
  completed: boolean;
};

export interface UpdateSubtaskDto {
  content?: string;
  completed?: boolean;
}
