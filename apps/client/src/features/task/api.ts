import { axiosInstance } from '@/lib/axios.ts';
import { BaseResponse } from '@/features/types.ts';
import { DetailedTask, UpdateTaskDto } from '@/features/task/types.ts';

export const taskAPI = {
  getDetail: async (taskId: number) => {
    const { data } = await axiosInstance.get<BaseResponse<DetailedTask>>(`/task/${taskId}/detail`);

    return data;
  },

  update: async (taskId: number, updateTaskDto: UpdateTaskDto) => {
    const { data } = await axiosInstance.patch<BaseResponse>(`/task/${taskId}`, updateTaskDto);

    return data;
  },

  updateAssignees: async (taskId: number, userIds: number[] = []) => {
    const { data } = await axiosInstance.put<BaseResponse>(`/task/${taskId}/assignees`, {
      userIds,
    });

    return data;
  },

  updateLabels: async (taskId: number, labelIds: number[] = []) => {
    const { data } = await axiosInstance.put<BaseResponse>(`/task/${taskId}/labels`, {
      labelIds,
    });

    return data;
  },
};
