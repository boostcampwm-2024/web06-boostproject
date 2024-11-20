import axios from 'axios';
import { createFileRoute } from '@tanstack/react-router';
import AccountSettings from '@/pages/AccountSettings';
import { GetProjectInvitationsResponseDTO } from '@/types/project';

export const Route = createFileRoute('/_auth/account/settings')({
  loader: ({ context: { auth, queryClient } }) => {
    queryClient.ensureQueryData({
      queryKey: ['project', 'invitations'],
      queryFn: async () => {
        try {
          const invitations = await axios.get<GetProjectInvitationsResponseDTO>(
            '/api/project/invitations',
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.accessToken}`,
              },
            }
          );
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
