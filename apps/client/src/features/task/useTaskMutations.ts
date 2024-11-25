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
      mutationFn: (description: string) => taskAPI.update(taskId, { description }),
      onSuccess: invalidateTask,
    }),

    updatePriority: useMutation({
      mutationFn: (priority: number) => taskAPI.update(taskId, { priority }),
      onSuccess: invalidateTask,
    }),

    updateSprint: useMutation({
      mutationFn: (sprintId: number) => taskAPI.update(taskId, { sprintId }),
      onSuccess: invalidateTask,
    }),

    updateEstimate: useMutation({
      mutationFn: (estimate: number) => taskAPI.update(taskId, { estimate }),
      onSuccess: invalidateTask,
    }),

    updateAssignees: useMutation({
      mutationFn: (userIds: number[]) => taskAPI.updateAssignees(taskId, userIds),
      onSuccess: invalidateTask,
    }),

    updateLabels: useMutation({
      mutationFn: (labelIds: number[]) => taskAPI.updateLabels(taskId, labelIds),
      onSuccess: invalidateTask,
    }),
  };
};
