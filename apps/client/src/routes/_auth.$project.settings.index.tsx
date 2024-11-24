import { createFileRoute } from '@tanstack/react-router';
import axios from 'axios';
import { GetProjectMembersResponseDTO } from '@/types/project.ts';
import ProjectSettings from '@/pages/ProjectSettings.tsx';

export const Route = createFileRoute('/_auth/$project/settings/')({
  loader: ({ context: { auth, queryClient }, params: { project } }) =>
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
    }),
  component: ProjectSettings,
});
