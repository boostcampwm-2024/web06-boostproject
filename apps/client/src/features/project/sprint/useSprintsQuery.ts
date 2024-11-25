import { useQuery } from '@tanstack/react-query';
import { projectAPI } from '@/features/project/api.ts';

export const useSprintsQuery = (projectId: number) => {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      const { result } = await projectAPI.getSprints(projectId);

      return result.sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      });
    },
    throwOnError: true,
  });
};
