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

  const sortedSections = sections.map((section) => ({
    ...section,
    tasks: section.tasks.sort((a, b) => a.position.localeCompare(b.position)),
  }));

  return (
    <div className="relative h-full overflow-hidden">
      <KanbanBoard key={projectId} sections={sortedSections} />
    </div>
  );
}
