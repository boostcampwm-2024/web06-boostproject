import { MutationOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { subtaskAPI } from '@/features/task/subtask/api';
import { Subtask, UpdateSubtaskDto } from '@/features/task/subtask/types';
import { BaseResponse } from '@/features/types.ts';

export const useSubtaskMutations = (taskId: number) => {
  const queryClient = useQueryClient();

  const invalidateTask = () => {
    queryClient.invalidateQueries({
      queryKey: ['task', taskId],
    });
  };

  return {
    create: (options?: MutationOptions<Subtask, Error, void>) =>
      useMutation({
        mutationFn: async () => {
          const { result } = await subtaskAPI.create(taskId);

          return result;
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
          const { result } = await subtaskAPI.update(subtaskId, updateSubtaskDto);

          return result;
        },
        onSuccess: (data, variables, context) => {
          invalidateTask();
          options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
          options?.onError?.(error, variables, context);
        },
      }),

    delete: (options?: MutationOptions<BaseResponse, Error, number>) =>
      useMutation({
        mutationFn: async (subtaskId: number) => {
          const response = await subtaskAPI.delete(subtaskId);

          return response;
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
