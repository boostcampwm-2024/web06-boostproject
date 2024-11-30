import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';

import { UserPlus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GetProjectMembersResponseDTO } from '@/types/project';
import { axiosInstance } from '@/lib/axios.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/lib/useToast';
import { BaseResponse, User } from '@/features/types.ts';
import { Input } from '@/components/ui/input.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';

function ProjectSettings() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchResults = [] } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const response = await axiosInstance.get<BaseResponse<User[]>>(`/user?search=${searchQuery}`);
      return response.data.result;
    },
    enabled: searchQuery.length >= 2,
  });

  const { mutate: inviteMember, isPending } = useMutation<BaseResponse, AxiosError, User>({
    mutationFn: (user: User) =>
      axiosInstance.post(`/project/${project}/invite`, {
        username: user.username,
        projectId: Number(project),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project, 'members'] });
      toast.success('Member invited successfully.');
      setSelectedUser(null);
      setSearchQuery('');
    },
    onError: (error) => {
      setSelectedUser(null);
      setSearchQuery('');
      if (error.response?.status === 404) {
        toast.error('User not found.');
        return;
      }

      if (error.response?.status === 409) {
        toast.error('User is already invited.');

        return;
      }

      toast.error('Failed to invite member.');
    },
  });

  const queryClient = useQueryClient();
  const { project } = useParams({ from: '/_auth/$project/settings' });
  const toast = useToast();

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
          <CardDescription>Search and select a member to invite.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              value={selectedUser?.id.toString() || ''}
              onValueChange={(value) => {
                const user = searchResults.find((u) => u.id.toString() === value);
                if (user) {
                  setSelectedUser(user);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Search member..." />
              </SelectTrigger>
              <SelectContent className="z-50 bg-white">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <Input
                    ref={inputRef}
                    placeholder="Type to search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                <ScrollArea className="">
                  {searchResults.map((user) => (
                    <SelectItem
                      key={user.id}
                      value={user.id.toString()}
                      onClick={() => {
                        setSelectedUser(user);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.profileImage} />
                          <AvatarFallback>
                            <div className="h-full w-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500" />
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.username}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {searchResults.length === 0 && (
                    <div className="px-2 py-4 text-center text-sm text-gray-500">
                      No users found
                    </div>
                  )}
                </ScrollArea>
              </SelectContent>
            </Select>

            {selectedUser && (
              <div className="flex items-center space-x-2 rounded-lg border bg-gray-50 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedUser.profileImage} />
                  <AvatarFallback>
                    <div className="h-full w-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500" />
                  </AvatarFallback>
                </Avatar>
                <span>{selectedUser.username}</span>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <Button
              className="w-full bg-black text-white hover:bg-black/80"
              onClick={() => selectedUser && inviteMember(selectedUser)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {isPending ? 'Inviting...' : 'Invite Member'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProjectSettings;
