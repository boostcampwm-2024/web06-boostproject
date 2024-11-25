import { useQuery } from '@tanstack/react-query';
import { projectAPI } from '@/features/project/api.ts';

export const useLabelsQuery = (projectId: number) => {
  return useQuery({
    queryKey: ['labels', projectId],
    queryFn: () => projectAPI.getLabels(projectId),
  });
};
