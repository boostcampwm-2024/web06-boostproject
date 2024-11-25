import { useQuery } from '@tanstack/react-query';
import { projectAPI } from '@/features/project/api.ts';

export const useUsersQuery = (projectId: number) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { result } = await projectAPI.getMembers(projectId);

      return result;
    },
    retry: 0,
  });
};
