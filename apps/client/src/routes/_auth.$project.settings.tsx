import axios from 'axios';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/authContext';
import TabView from '@/components/TabView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GetProjectMembersResponseDTO } from '@/types/project';

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

function ProjectSettings() {
  const auth = useAuth();
  const { project } = Route.useParams();
  const { data: members } = useSuspenseQuery({
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

  return (
    <TabView>
      <TabView.Title>Settings</TabView.Title>
      <TabView.Content>
        <div className="min-w-80 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Team Members</CardTitle>
              <CardDescription className="text-gray-500">Manage your team members.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-8 w-8 rounded-full bg-[#2ecc71]" />
                      <div>
                        <p className="font-medium">{member.username}</p>
                        <p className="text-sm text-gray-500">
                          {member.role === 'ADMIN' ? 'Owner' : 'Contributor'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Invite New Member</CardTitle>
              <CardDescription className="text-gray-500">
                Send an invitation to a new team member.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input id="username" placeholder="Enter username" />
                </div>
                <Button className="w-full bg-black text-white hover:bg-black/80">
                  <UserPlus className="mr-2 h-4 w-4" /> Invite Member
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle className="text-xl">Pending Invitations</CardTitle>
              <CardDescription className="text-gray-500">
                Manage your pending team invitations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {invitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-8 w-8 rounded-full bg-[#2ecc71]" />
                      <div>
                        <p className="font-medium">{invite.username}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>
      </TabView.Content>
    </TabView>
  );
}
