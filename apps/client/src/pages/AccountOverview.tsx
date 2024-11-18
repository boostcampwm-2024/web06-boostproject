import axios from 'axios';
import { useState } from 'react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/authContext';
import TabView from '@/components/TabView';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectDialog from '@/components/dialog/CreateProjectDialog';
import { CreateProjectRequestDTO, GetProjectsResponseDTO } from '@/types/project';

function AccountOverview() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: projects } = useSuspenseQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const projects = await axios.get<GetProjectsResponseDTO>('/api/projects', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });
        return projects.data.result;
      } catch {
        throw new Error('Failed to fetch projects');
      }
    },
  });
  const { isPending, mutate } = useMutation({
    mutationFn: async (data: CreateProjectRequestDTO) => {
      await axios.post('/api/project', data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.log('Failed to create project', error);
    },
  });

  return (
    <TabView>
      <TabView.Title>Account Overview</TabView.Title>
      <TabView.Content>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium">Projects</h2>
            <p className="mt-1 text-sm text-gray-500">
              The Projects that are associated with your Harmony account.
            </p>
          </div>
          <Button
            className="bg-black text-white hover:bg-black/80"
            onClick={() => setIsDialogOpen(true)}
          >
            Create a Project
          </Button>
          <CreateProjectDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onSubmit={mutate}
            isPending={isPending}
          />
        </div>
        <div className="flex flex-col gap-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </TabView.Content>
    </TabView>
  );
}

export default AccountOverview;
