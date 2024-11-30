import { useSuspenseQuery } from '@tanstack/react-query';
import { useLoaderData } from '@tanstack/react-router';
import { useEffect } from 'react';
import { boardAPI } from '@/features/project/board/api.ts';

import { useLongPollingEvents } from '@/features/project/board/useLongPollingEvents.ts';
import { useBoardStore } from '@/features/project/board/useBoardStore.ts';
import { KanbanBoard } from '@/features/project/board/components/KanbanBoard.tsx';

export function Board() {
  const { projectId } = useLoaderData({
    from: '/_auth/$project/board',
  });

  const { data: initialSections } = useSuspenseQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => boardAPI.getTasks(projectId),
  });

  useEffect(() => {
    useBoardStore.getState().setSections(
      initialSections.map((section) => ({
        ...section,
        tasks: [...section.tasks].sort((a, b) => a.position.localeCompare(b.position)),
      }))
    );
  }, [initialSections]);

  useLongPollingEvents(projectId, useBoardStore.getState().handleEvent);

  return (
    <div className="relative h-full overflow-hidden">
      <KanbanBoard projectId={projectId} />
    </div>
  );
}
