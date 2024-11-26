import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { projectAPI } from '@/features/project/api.ts';
import { CreateSprintDto, UpdateSprintDto } from '@/features/project/types.ts';
import { BaseResponse } from '@/features/types.ts';

export const useSprintMutations = (projectId: number) => {
  const queryClient = useQueryClient();

  const invalidateSprints = () => {
    queryClient.invalidateQueries({
      queryKey: ['sprints', projectId],
    });
  };

  return {
    create: useMutation<BaseResponse, AxiosError, CreateSprintDto>({
      mutationFn: (createSprintDto) => projectAPI.createSprint(projectId, createSprintDto),
      onSuccess: invalidateSprints,
    }),

    update: useMutation<
      BaseResponse,
      AxiosError,
      {
        sprintId: number;
        updateSprintDto: UpdateSprintDto;
      }
    >({
      mutationFn: ({ sprintId, updateSprintDto }) =>
        projectAPI.updateSprint(sprintId, updateSprintDto),
      onSuccess: invalidateSprints,
    }),

    delete: useMutation<BaseResponse, AxiosError, number>({
      mutationFn: (sprintId) => projectAPI.deleteSprint(sprintId),
      onSuccess: invalidateSprints,
    }),
  };
};
