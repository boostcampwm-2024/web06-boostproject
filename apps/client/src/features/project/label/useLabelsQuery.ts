import { useQuery } from '@tanstack/react-query';
import { projectAPI } from '@/features/project/api.ts';

export const useLabelsQuery = (projectId: number) => {
  return useQuery({
    queryKey: ['labels', projectId],
    queryFn: async () => {
      const { result } = await projectAPI.getLabels(projectId);

      return result;
    },
    throwOnError: true,
  });
};
