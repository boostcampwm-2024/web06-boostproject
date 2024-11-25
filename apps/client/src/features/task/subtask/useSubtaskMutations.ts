import { MutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { subtaskAPI } from '@/features/task/subtask/api';
import { Subtask, UpdateSubtaskDto } from '@/features/task/subtask/types';

export const useSubtaskMutations = (taskId: number) => {
  const queryClient = useQueryClient();

  const invalidateTask = () => {
    queryClient.invalidateQueries({
      queryKey: ['task', taskId],
      refetchType: 'none',
    });
  };

  return {
    create: (options?: MutationOptions<Subtask, Error, void>) =>
      useMutation({
        mutationFn: async () => {
          const data = await subtaskAPI.create(taskId);
          const { subtask } = data.result;

          return subtask;
        },
        onSuccess: (data, variables, context) => {
          invalidateTask();
          options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
          options?.onError?.(error, variables, context);
        },
      }),

    update: (
      options?: MutationOptions<
        Subtask,
        Error,
        {
          subtaskId: number;
          updateSubtaskDto: UpdateSubtaskDto;
        }
      >
    ) =>
      useMutation({
        mutationFn: async ({
          subtaskId,
          updateSubtaskDto,
        }: {
          subtaskId: number;
          updateSubtaskDto: UpdateSubtaskDto;
        }) => {
          const data = await subtaskAPI.update(subtaskId, updateSubtaskDto);
          const { subtask } = data.result;

          return subtask;
        },
        onSuccess: (data, variables, context) => {
          invalidateTask();
          options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
          options?.onError?.(error, variables, context);
        },
      }),

    delete: (options?: MutationOptions<Subtask, Error, number>) =>
      useMutation({
        mutationFn: async (subtaskId: number) => {
          const data = await subtaskAPI.delete(subtaskId);
          const { subtask } = data.result;

          return subtask;
        },
        onSuccess: (data, variables, context) => {
          invalidateTask();
          options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
          options?.onError?.(error, variables, context);
        },
      }),
  };
};
