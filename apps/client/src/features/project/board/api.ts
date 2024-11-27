import { AxiosRequestConfig } from 'axios';
import { axiosInstance } from '@/lib/axios.ts';
import { EventResponse, TasksResponse, UpdateDto } from '@/features/project/board/types.ts';

export const boardAPI = {
  getTasks: async (projectId: number) => {
    const response = await axiosInstance.get<TasksResponse>(`/task?projectId=${projectId}`);
    return response.data.result;
  },

  getEvent: async (projectId: number, config: AxiosRequestConfig = {}) => {
    const response = await axiosInstance.get<EventResponse>(
      `/event?projectId=${projectId}`,
      config
    );
    return response.data.result;
  },

  update: async (projectId: number, data: UpdateDto) => {
    const response = await axiosInstance.post(`/project/${projectId}/update`, data);
    return response.data.result;
  },
};
