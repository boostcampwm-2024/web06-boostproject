import { axiosInstance } from '@/lib/axios.ts';
import { BaseResponse } from '@/features/types.ts';
import {
  CreateSubtaskResponse,
  UpdateSubtaskResponse,
  UpdateSubtaskDto,
} from '@/features/task/subtask/types.ts';

export const subtaskAPI = {
  create: async (taskId: number) => {
    const { data } = await axiosInstance.post<CreateSubtaskResponse>(`/task/${taskId}/subtask`, {
      content: 'New Subtask',
    });

    return data;
  },

  update: async (subtaskId: number, updateSubtaskDto: UpdateSubtaskDto) => {
    const { data } = await axiosInstance.patch<UpdateSubtaskResponse>(
      `/subtask/${subtaskId}`,
      updateSubtaskDto
    );

    return data;
  },

  delete: async (subtaskId: number) => {
    const { data } = await axiosInstance.delete<BaseResponse>(`/subtask/${subtaskId}`);

    return data;
  },
};
