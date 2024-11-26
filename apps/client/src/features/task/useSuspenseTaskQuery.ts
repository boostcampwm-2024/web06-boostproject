import { useSuspenseQuery } from '@tanstack/react-query';
import { taskAPI } from '@/features/task/api.ts';

export const useSuspenseTaskQuery = (taskId: number) => {
  return useSuspenseQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskAPI.getDetail(taskId),
    retry: 0,
  });
};
