import { BaseResponse } from '@/features/types.ts';

export type Subtask = {
  id: number;
  content: string;
  completed: boolean;
};

// create
export type CreateSubtaskResponse = BaseResponse<Subtask>;

// update
export interface UpdateSubtaskDto {
  content?: string;
  completed?: boolean;
}

export type UpdateSubtaskResponse = BaseResponse<Subtask>;

// delete
export interface DeleteSubtaskResult {
  subtask: {
    id: number;
    content: string;
    completed: boolean;
  };
}
