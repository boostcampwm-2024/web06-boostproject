import { useQuery } from '@tanstack/react-query';
import { taskAPI } from '@/features/task/api.ts';

export const useTaskQuery = (taskId: number) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { result } = await taskAPI.getDetail(taskId);

      return result;
    },
    retry: 0,
  });
};
