import axios from 'axios';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Check, Inbox, X } from 'lucide-react';
import TabView from '@/components/TabView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/authContext';
import { Button } from '@/components/ui/button';
import {
  GetProjectInvitationsResponseDTO,
  HandleProjectInvitationRequestDTO,
} from '@/types/project';

function AccountSettings() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const { data: invitations } = useSuspenseQuery({
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
  const { mutate } = useMutation({
    mutationFn: async ({
      projectId,
      payload,
    }: {
      projectId: number;
      payload: HandleProjectInvitationRequestDTO;
    }) => {
      await axios.patch(`/api/project/${projectId}/invite`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', 'invitations'] });
    },
    onError: (error) => {
      alert('Failed to respond to invitation');
      console.log('Failed to respond to invitation', error);
    },
  });

  const handleAcceptButtonClick = (contributorId: number, projectId: number) => {
    mutate({ projectId, payload: { contributorId, status: 'ACCEPTED' } });
  };

  const handleDeclineButtonClick = (contributorId: number, projectId: number) => {
    mutate({ projectId, payload: { contributorId, status: 'REJECTED' } });
  };

  return (
    <TabView>
      <TabView.Title>Account Settings</TabView.Title>
      <TabView.Content>
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-xl">Pending Invitations</CardTitle>
            <CardDescription className="text-gray-500">
              Manage your pending team invitations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invitations.length > 0 ? (
                invitations.map((invitation) => (
                  <div
                    key={invitation.contributorId}
                    className="flex items-center justify-between rounded-lg border bg-[#fafafa] p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-8 w-8 rounded-full bg-[#2ecc71]" />
                      <div>
                        <p className="text-lg font-medium">{invitation.projectTitle}</p>
                        <p className="text-sm text-gray-500">Invited by {invitation.inviter}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        className="bg-black hover:bg-black/80"
                        onClick={() =>
                          handleAcceptButtonClick(invitation.contributorId, invitation.projectId)
                        }
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        className="bg-white text-black hover:bg-white/80"
                        onClick={() =>
                          handleDeclineButtonClick(invitation.contributorId, invitation.projectId)
                        }
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Inbox className="mx-auto h-12 w-12" />
                  <h3 className="mt-2 text-lg font-medium">No invitations</h3>
                  <p className="mt-1 text-gray-500">
                    You don&apos;t have any pending project invitations.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabView.Content>
    </TabView>
  );
}

export default AccountSettings;
