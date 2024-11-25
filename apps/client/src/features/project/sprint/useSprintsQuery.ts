import { useQuery } from '@tanstack/react-query';
import { projectAPI } from '@/features/project/api.ts';

export const useSprintsQuery = (projectId: number) => {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      const data = await projectAPI.getSprints(projectId);
      const { sprints } = data.result;

      return sprints;
    },
    throwOnError: true,
  });
};
