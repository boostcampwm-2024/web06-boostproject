import { axiosInstance } from '@/lib/axios.ts';
import { BaseResponse } from '@/features/types.ts';
import {
  CreateSubtaskResult,
  DeleteSubtaskResult,
  UpdateSubtaskDto,
  UpdateSubtaskResult,
} from '@/features/task/subtask/types.ts';

export const subtaskAPI = {
  create: async (taskId: number) => {
    const { data } = await axiosInstance.post<BaseResponse<CreateSubtaskResult>>(
      `/task/${taskId}/subtask`,
      {
        title: 'New Subtask',
      }
    );

    return data;
  },

  update: async (subtaskId: number, updateSubtaskDto: UpdateSubtaskDto) => {
    const { data } = await axiosInstance.patch<BaseResponse<UpdateSubtaskResult>>(
      `/subtask/${subtaskId}`,
      updateSubtaskDto
    );

    return data;
  },

  delete: async (subtaskId: number) => {
    const { data } = await axiosInstance.delete<BaseResponse<DeleteSubtaskResult>>(
      `/subtask/${subtaskId}`
    );

    return data;
  },
};
