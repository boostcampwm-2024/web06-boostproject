import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateSprintDto, UpdateSprintDto } from '@/features/project/types.ts';
import { projectAPI } from '@/features/project/api.ts';

export const useSprintMutations = (projectId: number) => {
  const queryClient = useQueryClient();

  const invalidateSprints = () => {
    queryClient.invalidateQueries({
      queryKey: ['sprints', projectId],
    });
  };

  return {
    create: useMutation({
      mutationFn: (createSprintDto: CreateSprintDto) =>
        projectAPI.createSprint(projectId, createSprintDto),
      onSuccess: invalidateSprints,
    }),

    update: useMutation({
      mutationFn: ({
        sprintId,
        updateSprintDto,
      }: {
        sprintId: number;
        updateSprintDto: UpdateSprintDto;
      }) => projectAPI.updateSprint(sprintId, updateSprintDto),
      onSuccess: invalidateSprints,
    }),

    delete: useMutation({
      mutationFn: (sprintId: number) => projectAPI.deleteSprint(sprintId),
      onSuccess: invalidateSprints,
    }),
  };
};
