import { createFileRoute } from '@tanstack/react-router';
import { GetProjectMembersResponseDTO } from '@/types/project.ts';
import ProjectSettings from '@/pages/ProjectSettings.tsx';
import { axiosInstance } from '@/lib/axios.ts';

export const Route = createFileRoute('/_auth/$project/settings/')({
  loader: ({ context: { queryClient }, params: { project } }) =>
    queryClient.ensureQueryData({
      queryKey: ['project', project, 'members'],
      queryFn: async () => {
        try {
          const members = await axiosInstance.get<GetProjectMembersResponseDTO>(
            `/api/project/${project}/members`
          );
          return members.data.result;
        } catch {
          throw new Error('Failed to fetch members');
        }
      },
    }),
  component: ProjectSettings,
});
