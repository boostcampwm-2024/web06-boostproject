import { createFileRoute } from '@tanstack/react-router';
import { GetProjectsResponseDTO } from '@/types/project';
import AccountOverview from '@/pages/AccountOverview';
import { axiosInstance } from '@/lib/axios.ts';

export const Route = createFileRoute('/_auth/account/')({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData({
      queryKey: ['projects'],
      queryFn: async () => {
        try {
          const projects = await axiosInstance.get<GetProjectsResponseDTO>('/projects');
          return projects.data.result;
        } catch {
          throw new Error('Failed to fetch projects');
        }
      },
    });
  },
  errorComponent: () => <div>Failed to load projects</div>,
  component: AccountOverview,
});
