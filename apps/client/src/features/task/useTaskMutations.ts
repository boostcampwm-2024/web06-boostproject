import { useMutation } from '@tanstack/react-query';
import { taskAPI } from '@/features/task/api.ts';

export const useTaskMutations = (taskId: number) => {
  return {
    updateDescription: useMutation({
      mutationFn: (description?: string) => taskAPI.update(taskId, { description }),
    }),

    updatePriority: useMutation({
      mutationFn: (priority?: number) => taskAPI.update(taskId, { priority: priority ?? null }),
    }),

    updateSprint: useMutation({
      mutationFn: (sprintId?: number) => taskAPI.update(taskId, { sprintId: sprintId ?? null }),
    }),

    updateEstimate: useMutation({
      mutationFn: (estimate?: number) => taskAPI.update(taskId, { estimate: estimate ?? null }),
    }),

    updateAssignees: useMutation({
      mutationFn: (assignees?: number[]) => taskAPI.updateAssignees(taskId, assignees),
      onSuccess: () => {},
    }),

    updateLabels: useMutation({
      mutationFn: (labels?: number[]) => taskAPI.updateLabels(taskId, labels),
      onSuccess: () => {},
    }),

    deleteTask: useMutation({
      mutationFn: () => taskAPI.delteTask(taskId),
    }),
  };
};
