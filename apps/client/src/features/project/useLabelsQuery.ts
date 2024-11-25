import { useQuery } from '@tanstack/react-query';
import { projectAPI } from '@/features/project/api.ts';

export const useLabelsQuery = (projectId: number) => {
  return useQuery({
    queryKey: ['labels', projectId],
    queryFn: async () => {
      const data = await projectAPI.getLabels(projectId);
      const { labels } = data.result;

      return labels;
    },
    throwOnError: true,
  });
};
