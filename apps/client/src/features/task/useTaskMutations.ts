import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTaskDto } from '@/features/task/types.ts';
import { taskAPI } from '@/features/task/api.ts';

export const useTaskMutations = (taskId: number) => {
  const queryClient = useQueryClient();

  return {
    update: useMutation({
      mutationFn: (updateTaskDto: UpdateTaskDto) => taskAPI.update(taskId, updateTaskDto),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['task', taskId],
        });
      },
    }),

    updateAssignees: useMutation({
      mutationFn: (userIds: number[]) => taskAPI.updateAssignees(taskId, userIds),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['task', taskId],
        });
      },
    }),

    updateLabels: useMutation({
      mutationFn: (labelIds: number[]) => taskAPI.updateLabels(taskId, labelIds),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['task', taskId],
        });
      },
    }),
  };
};
