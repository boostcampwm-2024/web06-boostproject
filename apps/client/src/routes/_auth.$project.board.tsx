import { Suspense } from 'react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import Board from '@/pages/Board.tsx';
import PlanningPokerFloatingButton from '@/components/PlanningPokerFloatingButton';
import { boardAPI } from '@/features/project/board/api.ts';

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

    const sections = await queryClient.ensureQueryData({
      queryKey: ['tasks', projectId],
      queryFn: () => boardAPI.getTasks(projectId),
      staleTime: 0,
    });

    return { projectId, sections };
  },
  errorComponent: () => <div>error in board</div>,
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
