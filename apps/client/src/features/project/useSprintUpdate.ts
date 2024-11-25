import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateSprintDto, UpdateSprintDto } from '@/features/project/types.ts';
import { projectAPI } from '@/features/project/api.ts';

export const useSprintUpdate = (projectId: number) => {
  const queryClient = useQueryClient();

  return {
    create: useMutation({
      mutationFn: (createSprintDto: CreateSprintDto) =>
        projectAPI.createSprint(projectId, createSprintDto),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['sprints', projectId],
        });
      },
    }),

    update: useMutation({
      mutationFn: ({
        sprintId,
        updateSprintDto,
      }: {
        sprintId: number;
        updateSprintDto: UpdateSprintDto;
      }) => projectAPI.updateSprint(sprintId, updateSprintDto),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['sprints', projectId],
        });
      },
    }),

    delete: useMutation({
      mutationFn: (sprintId: number) => projectAPI.deleteSprint(sprintId),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['sprints', projectId],
        });
      },
    }),
  };
};
