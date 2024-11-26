import { useSuspenseQuery } from '@tanstack/react-query';
import { taskAPI } from '@/features/task/api.ts';

export const useSuspenseTaskQuery = (taskId: number) => {
  return useSuspenseQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { result } = await taskAPI.getDetail(taskId);

      return result;
    },
    retry: 0,
  });
};
