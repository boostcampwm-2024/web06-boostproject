import { axiosInstance } from '@/lib/axios.ts';
import { BaseResponse } from '@/features/types.ts';
import { UpdateSubtaskDto } from '@/features/subtask/types.ts';

export const subtaskAPI = {
  create: async (taskId: number) => {
    const { data } = await axiosInstance.post<BaseResponse>(`/task/${taskId}/subtask`, {
      title: '새로운 하위 태스크',
    });

    return data;
  },

  update: async (subtaskId: number, updateSubtaskDto: UpdateSubtaskDto) => {
    const { data } = await axiosInstance.patch<BaseResponse>(
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
