import { createFileRoute } from '@tanstack/react-router';
import AccountSettings from '@/pages/AccountSettings';
import { GetProjectInvitationsResponseDTO } from '@/types/project';
import { axiosInstance } from '@/lib/axios.ts';

export const Route = createFileRoute('/_auth/account/settings')({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData({
      queryKey: ['project', 'invitations'],
      queryFn: async () => {
        try {
          const invitations =
            await axiosInstance.get<GetProjectInvitationsResponseDTO>('/project/invitations');
          return invitations.data.result;
        } catch {
          throw new Error('Failed to fetch invitations');
        }
      },
    });
  },
  errorComponent: () => <div>Failed to load invitations</div>,
  component: AccountSettings,
});
