import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GetProjectMembersResponseDTO, InviteProjectMemberRequestDTO } from '@/types/project';
import { axiosInstance } from '@/lib/axios.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required.')
    .regex(/^[a-zA-Z0-9 ]*$/, 'Only English letters and numbers are allowed.'),
});

function ProjectSettings() {
  const queryClient = useQueryClient();
  const { project } = useParams({ from: '/_auth/$project/settings' });

  const { data: members } = useSuspenseQuery({
    queryKey: ['project', project, 'members'],
    queryFn: async () => {
      try {
        const members = await axiosInstance.get<GetProjectMembersResponseDTO>(
          `/project/${project}/members`
        );
        return members.data.result;
      } catch {
        throw new Error('Failed to fetch members');
      }
    },
  });

  const { isPending, mutate } = useMutation({
    mutationFn: async (data: InviteProjectMemberRequestDTO) => {
      await axiosInstance.post(`/project/${project}/invite`, data);
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
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-xl">Team Members</CardTitle>
          <CardDescription>Manage your team members.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border bg-[#fafafa] p-4"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8 rounded-full border">
                    <AvatarImage src={member.profileImage} className="object-cover" alt="Avatar" />
                    <AvatarFallback>
                      <div className="h-full w-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500" />
                    </AvatarFallback>
                  </Avatar>
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
          <CardDescription>Send an invitation to a new team member.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
                <div className="mt-1">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    {...register('username')}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
                  )}
                </div>
              </label>
            </div>
            <Button
              className="w-full bg-black text-white hover:bg-black/80"
              type="submit"
              disabled={isPending}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isPending ? 'Inviting...' : 'Invite Member'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProjectSettings;
