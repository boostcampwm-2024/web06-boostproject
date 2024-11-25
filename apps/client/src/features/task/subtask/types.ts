export type Subtask = {
  id: number;
  content: string;
  completed: boolean;
};

// create
export interface CreateSubtaskResult {
  subtask: {
    id: number;
    content: string;
    completed: boolean;
  };
}

// update
export interface UpdateSubtaskDto {
  content?: string;
  completed?: boolean;
}

export interface UpdateSubtaskResult {
  subtask: {
    id: number;
    content: string;
    completed: boolean;
  };
}

// delete
export interface DeleteSubtaskResult {
  subtask: {
    id: number;
    content: string;
    completed: boolean;
  };
}
