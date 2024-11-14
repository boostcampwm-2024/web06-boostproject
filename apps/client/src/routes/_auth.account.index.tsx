import axios from 'axios';
import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@/shared/ui/button';
import { useAuth } from '@/features/auth/authContext.tsx';
import TabView from '@/shared/components/TabView';
import ProjectCard from '@/shared/components/ProjectCard';

type Project = {
  id: number;
  title: string;
  createdAt: string;
  role: string;
};

type ProjectResponse = {
  status: number;
  message: string;
  result: Project[];
};

export const Route = createFileRoute('/_auth/account/')({
  loader: ({ context: { auth, queryClient } }) => {
    queryClient.ensureQueryData({
      queryKey: ['projects'],
      queryFn: async () => {
        try {
          const projects = await axios.get<ProjectResponse>('/api/projects', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${auth.accessToken}`,
            },
          });
          return projects.data.result;
        } catch (error) {
          throw new Error('Failed to fetch projects');
        }
      },
    });
  },
  errorComponent: () => <div>Failed to load projects</div>,
  component: AccountIndex,
});

function AccountIndex() {
  const auth = useAuth();
  const { data: projects } = useSuspenseQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        const projects = await axios.get<ProjectResponse>('/api/projects', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });
        return projects.data.result;
      } catch (error) {
        throw new Error('Failed to fetch projects');
      }
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
          <Button className="bg-black text-white hover:bg-black/80">Create a Project</Button>
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
