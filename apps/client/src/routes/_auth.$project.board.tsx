import { Suspense } from 'react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import PlanningPokerFloatingButton from '@/components/PlanningPokerFloatingButton';
import { boardAPI } from '@/features/project/board/api.ts';
import { Board } from '@/pages/Board.tsx';

class InvalidProjectIdError extends Error {
  constructor(param: string) {
    super(`Invalid task ID provided: ${param}`);
  }
}

export const Route = createFileRoute('/_auth/$project/board')({
  beforeLoad: ({ params }) => {
    const projectId = Number(params.project);
    if (Number.isNaN(projectId)) {
      throw new InvalidProjectIdError(params.project);
    }
  },

  loader: async ({ context: { queryClient }, params: { project } }) => {
    const projectId = Number(project);

    await queryClient.prefetchQuery({
      queryKey: ['tasks', projectId],
      queryFn: () => boardAPI.getTasks(projectId),
      staleTime: 5 * 60 * 1000, // 5분
    });

    return { projectId };
  },

  onLeave: ({ context: { queryClient }, params: { project } }) => {
    const projectId = Number(project);

    queryClient.invalidateQueries({
      queryKey: ['tasks', projectId],
    });
  },

  component: () => (
    <Suspense fallback={<LoadingFallback />}>
      <Board />
      <PlanningPokerFloatingButton />
      <Outlet />
    </Suspense>
  ),
});

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
