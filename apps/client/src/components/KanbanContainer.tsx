import axios from 'axios';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { useAuth } from '@/contexts/authContext.tsx';
import Kanban from '@/components/Kanban.tsx';
import { TSection } from '@/types';

export default function KanbanContainer() {
  const { project: projectId } = useParams({ from: '/_auth/$project/board' });
  const auth = useAuth();

  const fetchTasks = async (projectId: string) => {
    const { data } = await axios.get(`/api/task?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    return data.result as TSection[];
  };

  const { data: sections } = useSuspenseQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => fetchTasks(projectId),
    staleTime: 1000 * 60 * 5,
  });

  return <Kanban sections={sections} />;
}
