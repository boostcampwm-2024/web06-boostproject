import { useMutation } from '@tanstack/react-query';
import { subtaskAPI } from '@/features/task/subtask/api';
import { UpdateSubtaskDto } from '@/features/task/subtask/types';

export const useSubtaskMutations = (taskId: number) => {
  return {
    create: useMutation({
      mutationFn: async () => {
        const { result } = await subtaskAPI.create(taskId);

        return result;
      },
    }),

    update: useMutation({
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
    }),

    delete: useMutation({
      mutationFn: async (subtaskId: number) => {
        const { result } = await subtaskAPI.delete(subtaskId);

        return result;
      },
    }),
  };
};
