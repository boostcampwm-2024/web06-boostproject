import { axiosInstance } from '@/lib/axios.ts';
import { EventResponse, TasksResponse } from '@/features/project/board/types.ts';

export const boardAPI = {
  getTasks: async (projectId: number) => {
    const response = await axiosInstance.get<TasksResponse>(`/task?projectId=${projectId}`);
    return response.data.result;
  },

  getEvents: async (projectId: string) => {
    const response = await axiosInstance.get<EventResponse>(`/task/events?projectId=${projectId}`);
    return response.data.result;
  },
};
