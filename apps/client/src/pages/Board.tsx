import { useSuspenseQuery } from '@tanstack/react-query';
import { useLoaderData } from '@tanstack/react-router';
import { boardAPI } from '@/features/project/board/api.ts';
import { KanbanBoard } from '@/features/project/board/components/KanbanBoard.tsx';

export function Board() {
  const { projectId } = useLoaderData({
    from: '/_auth/$project/board',
  });
  const { data: sections } = useSuspenseQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => boardAPI.getTasks(projectId),
  });

  return (
    <div className="relative h-full overflow-hidden">
      <KanbanBoard sections={sections} />
    </div>
  );
}
