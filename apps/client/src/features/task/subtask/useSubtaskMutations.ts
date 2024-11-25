import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subtaskAPI } from '@/features/task/subtask/api.ts';
import { UpdateSubtaskDto } from '@/features/task/subtask/types.ts';

export const useSubtaskMutations = (taskId: number) => {
  const queryClient = useQueryClient();

  const invalidateTask = () => {
    queryClient.invalidateQueries({
      queryKey: ['task', taskId],
    });
  };

  return {
    create: useMutation({
      mutationFn: () => subtaskAPI.create(taskId),
      onSuccess: invalidateTask,
    }),

    update: useMutation({
      mutationFn: ({
        subtaskId,
        updateSubtaskDto,
      }: {
        subtaskId: number;
        updateSubtaskDto: UpdateSubtaskDto;
      }) => subtaskAPI.update(subtaskId, updateSubtaskDto),
      onSuccess: invalidateTask,
    }),

    delete: useMutation({
      mutationFn: (subtaskId: number) => subtaskAPI.delete(subtaskId),
      onSuccess: invalidateTask,
    }),
  };
};
