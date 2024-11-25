import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskAPI } from '@/features/task/api.ts';

export const useTaskMutations = (taskId: number) => {
  const queryClient = useQueryClient();

  const invalidateTask = () => {
    queryClient.invalidateQueries({
      queryKey: ['task', taskId],
    });
  };

  return {
    updateDescription: useMutation({
      mutationFn: (description?: string) => taskAPI.update(taskId, { description }),
      onSuccess: invalidateTask,
    }),

    updatePriority: useMutation({
      mutationFn: (priority?: number) => taskAPI.update(taskId, { priority: priority ?? null }),
      onSuccess: invalidateTask,
    }),

    updateSprint: useMutation({
      mutationFn: (sprintId?: number) => taskAPI.update(taskId, { sprintId: sprintId ?? null }),
      onSuccess: invalidateTask,
    }),

    updateEstimate: useMutation({
      mutationFn: (estimate?: number) => taskAPI.update(taskId, { estimate: estimate ?? null }),
      onSuccess: invalidateTask,
    }),

    updateAssignees: useMutation({
      mutationFn: (assignees?: number[]) => taskAPI.updateAssignees(taskId, assignees),
      onSuccess: invalidateTask,
    }),

    updateLabels: useMutation({
      mutationFn: (labels?: number[]) => taskAPI.updateLabels(taskId, labels),
      onSuccess: invalidateTask,
    }),
  };
};
