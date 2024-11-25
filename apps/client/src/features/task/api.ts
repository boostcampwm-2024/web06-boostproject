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

  updateAssignees: async (taskId: number, assignees: number[] = []) => {
    const { data } = await axiosInstance.put<BaseResponse>(`/task/${taskId}/assignees`, {
      assignees,
    });

    return data;
  },

  updateLabels: async (taskId: number, labels: number[] = []) => {
    const { data } = await axiosInstance.put<BaseResponse>(`/task/${taskId}/labels`, {
      labels,
    });

    return data;
  },
};
