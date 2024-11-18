import axios from 'axios';
import { createFileRoute } from '@tanstack/react-router';
import { GetProjectsResponseDTO } from '@/types/project';
import AccountOverview from '@/pages/AccountOverview';

export const Route = createFileRoute('/_auth/account/')({
  loader: ({ context: { auth, queryClient } }) => {
    queryClient.ensureQueryData({
      queryKey: ['projects'],
      queryFn: async () => {
        try {
          const projects = await axios.get<GetProjectsResponseDTO>('/api/projects', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${auth.accessToken}`,
            },
          });
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
