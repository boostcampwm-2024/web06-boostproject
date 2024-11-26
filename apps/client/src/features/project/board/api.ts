import { axiosInstance } from '@/lib/axios.ts';
import { BaseResponse } from '@/features/types.ts';
import { Section } from '@/features/project/board/types.ts';

export type TasksResponse = BaseResponse<Section[]>;
export type EventResponse = BaseResponse<Event>;

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
