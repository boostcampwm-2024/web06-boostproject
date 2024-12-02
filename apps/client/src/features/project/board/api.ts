import { AxiosRequestConfig } from 'axios';
import { axiosInstance } from '@/lib/axios.ts';
import { EventResponse, TasksResponse, UpdateDto } from '@/features/project/board/types.ts';

export const boardAPI = {
  getTasks: async (projectId: number) => {
    const response = await axiosInstance.get<TasksResponse>(`/task?projectId=${projectId}`);

    const { version, project } = response.data.result;

    return {
      version,
      sections: project.map((section) => {
        return {
          ...section,
          tasks: section.tasks.sort((a, b) => a.position.localeCompare(b.position)),
        };
      }),
    };
  },

  getEvent: async (projectId: number, version: number, config: AxiosRequestConfig = {}) => {
    const response = await axiosInstance.get<EventResponse>(
      `/event?projectId=${projectId}&version=${version}`,
      config
    );
    return response.data.result;
  },

  update: async (projectId: number, data: UpdateDto) => {
    const response = await axiosInstance.post(`/project/${projectId}/update`, data);
    return response.data.result;
  },
};
