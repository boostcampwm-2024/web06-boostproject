import { AxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { BaseResponse } from '@/features/types.ts';
import {
  CreateTaskDto,
  UpdatePositionDto,
  UpdateTitleDto,
} from '@/features/project/board/types.ts';
import { boardAPI } from '@/features/project/board/api.ts';

export const useBoardMutations = (projectId: number) => {
  return {
    createTask: useMutation<
      {
        id: number;
        position: string;
      },
      AxiosError,
      CreateTaskDto
    >({
      mutationFn: (createTaskDto) => boardAPI.update(projectId, createTaskDto),
    }),

    updatePosition: useMutation<BaseResponse, AxiosError, UpdatePositionDto>({
      mutationFn: (updatePositionDto) => boardAPI.update(projectId, updatePositionDto),
    }),

    updateTitle: useMutation<BaseResponse, AxiosError, UpdateTitleDto>({
      mutationFn: (updateTitleDto) => boardAPI.update(projectId, updateTitleDto),
    }),
  };
};
