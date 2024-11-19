import axios from 'axios';
import { createFileRoute } from '@tanstack/react-router';
import { GetProjectMembersResponseDTO } from '@/types/project';

import ProjectSettings from '@/pages/ProjectSettings';

export const Route = createFileRoute('/_auth/$project/settings')({
  loader: ({ context: { auth, queryClient }, params: { project } }) => {
    queryClient.ensureQueryData({
      queryKey: ['project', project, 'members'],
      queryFn: async () => {
        try {
          const members = await axios.get<GetProjectMembersResponseDTO>(
            `/api/project/${project}/members`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );
          return members.data.result;
        } catch {
          throw new Error('Failed to fetch members');
        }
      },
    });
  },
  errorComponent: () => <div>Failed to fetch members</div>,
  component: ProjectSettings,
});
