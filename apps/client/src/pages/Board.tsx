import { useSuspenseQuery } from '@tanstack/react-query';
import { useLoaderData } from '@tanstack/react-router';
import { boardAPI } from '@/features/project/board/api.ts';

import { useLongPollingEvents } from '@/features/project/board/useLongPollingEvents.ts';
import { BoardState, useBoardStore } from '@/features/project/board/useBoardStore.ts';
import { KanbanBoard } from '@/features/project/board/components/KanbanBoard.tsx';

const handleEventSelector = (state: BoardState) => state.handleEvent;
const setSectionsSelector = (state: BoardState) => state.setSections;

export function Board() {
  const { projectId } = useLoaderData({
    from: '/_auth/$project/board',
  });

  const setSections = useBoardStore(setSectionsSelector);
  const handleEvent = useBoardStore(handleEventSelector);

  const {
    data: { sections: initialSections },
  } = useSuspenseQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => boardAPI.getTasks(projectId),
    refetchInterval: 5 * 60 * 1000, // 5분
  });

  setSections(initialSections);

  useLongPollingEvents(projectId, handleEvent);

  return <KanbanBoard projectId={projectId} />;
}
