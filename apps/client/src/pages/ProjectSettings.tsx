import axios from 'axios';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/authContext';
import TabView from '@/components/TabView';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GetProjectMembersResponseDTO, InviteProjectMemberRequestDTO } from '@/types/project';

const formSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required.')
    .regex(/^[a-zA-Z0-9 ]*$/, 'Only English letters and numbers are allowed.'),
});

function ProjectSettings() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const { project } = useParams({ from: '/_auth/$project/settings' });
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
  const { isPending, mutate } = useMutation({
    mutationFn: async (data: InviteProjectMemberRequestDTO) => {
      await axios.post(`/api/project/${project}/invite`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project, 'members'] });
    },
    onError: (error) => {
      alert('Failed to invite member');
      console.log('Failed to invite member', error);
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteProjectMemberRequestDTO>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: InviteProjectMemberRequestDTO) => {
    mutate({ ...data, projectId: Number(project) });
  };

  return (
    <TabView>
      <TabView.Title>Settings</TabView.Title>
      <TabView.Content>
        <div className="min-w-80 space-y-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl">Team Members</CardTitle>
              <CardDescription className="text-gray-500">Manage your team members.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border bg-[#fafafa] p-4"
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

          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-xl">Invite New Member</CardTitle>
              <CardDescription className="text-gray-500">
                Send an invitation to a new team member.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-2">
                  <label htmlFor="username">
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      className="bg-[#fafafa]"
                      {...register('username')}
                    />
                    {errors.username && (
                      <span className="text-sm text-red-500">{errors.username.message}</span>
                    )}
                  </label>
                  <Button
                    className="w-full bg-black text-white hover:bg-black/80"
                    type="submit"
                    disabled={isPending}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isPending ? 'Inviting...' : 'Invite Member'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </TabView.Content>
    </TabView>
  );
}

export default ProjectSettings;
