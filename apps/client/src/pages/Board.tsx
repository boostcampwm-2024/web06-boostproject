import { Suspense } from 'react';
import { Outlet } from '@tanstack/react-router';
import KanbanBoard from '@/components/KanbanBoard.tsx';

export default function Board() {
  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <KanbanBoard />
      </Suspense>
      <div className="relative">
        <Outlet />
      </div>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
