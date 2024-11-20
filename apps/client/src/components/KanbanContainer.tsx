import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { useAuth } from '@/contexts/authContext.tsx';
import Kanban from '@/components/Kanban.tsx';
import { TSection } from '@/types';

export default function KanbanContainer() {
  const { project: projectId } = useParams({ from: '/_auth/$project/board' });
  const auth = useAuth();
  const queryClient = useQueryClient();

  const fetchTasks = async (projectId: string) => {
    const { data } = await axios.get(`/api/task?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });

    const sections = data.result as TSection[];
    return sections.map((section) => {
      section.tasks.sort((a, b) => a.position.localeCompare(b.position));
      return section;
    });
  };

  // 실제 태스크 데이터를 위한 쿼리
  const {
    data: sections,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => fetchTasks(projectId),
  });

  // 이벤트 폴링을 위한 쿼리
  useQuery({
    queryKey: ['events', projectId],
    queryFn: async () => {
      const response = await axios.get(`/api/event?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });

      if (response.data) {
        queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      }

      return response;
    },
    refetchInterval: 1000, // 3초마다 폴링
  });

  if (isLoading) {
    return <div>ㄹ ㅗ ㄷ ㅣ ㅈ ㅜ ㅇ</div>;
  }

  return <Kanban sections={sections!} refetch={refetch} />;
}
