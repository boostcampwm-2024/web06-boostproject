import { axiosInstance } from '@/lib/axios.ts';
import { BaseResponse } from '@/features/types.ts';
import {
  CreateLabelDto,
  CreateSprintDto,
  GetLabelsResult,
  GetSprintsResult,
  UpdateLabelDto,
  UpdateSprintDto,
} from '@/features/project/types.ts';

export const projectAPI = {
  // labels
  getLabels: async (projectId: number) => {
    const { data } = await axiosInstance.get<BaseResponse<GetLabelsResult>>(
      `/project/${projectId}/labels`
    );

    return data;
  },

  createLabel: async (projectId: number, createLabelDto: CreateLabelDto) => {
    const { data } = await axiosInstance.post<BaseResponse>(
      `/project/${projectId}/label`,
      createLabelDto
    );

    return data;
  },

  updateLabel: async (labelId: number, updateLabelDto: UpdateLabelDto) => {
    const { data } = await axiosInstance.patch<BaseResponse>(`/label/${labelId}`, updateLabelDto);

    return data;
  },

  deleteLabel: async (labelId: number) => {
    const { data } = await axiosInstance.delete<BaseResponse>(`/label/${labelId}`);

    return data;
  },

  // sprints
  getSprints: async (projectId: number) => {
    const { data } = await axiosInstance.get<BaseResponse<GetSprintsResult>>(
      `/project/${projectId}/sprints`
    );

    return data;
  },

  createSprint: async (projectId: number, createSprintDto: CreateSprintDto) => {
    const { data } = await axiosInstance.post<BaseResponse>(
      `/project/${projectId}/sprint`,
      createSprintDto
    );

    return data;
  },

  updateSprint: async (sprintId: number, updateSprintDto: UpdateSprintDto) => {
    const { data } = await axiosInstance.patch<BaseResponse>(
      `/sprint/${sprintId}`,
      updateSprintDto
    );

    return data;
  },

  deleteSprint: async (sprintId: number) => {
    const { data } = await axiosInstance.delete<BaseResponse>(`/sprint/${sprintId}`);

    return data;
  },
};
