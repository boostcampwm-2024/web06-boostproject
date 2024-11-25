import { Suspense } from 'react';
import KanbanBoard from '@/components/KanbanBoard.tsx';

export default function Board() {
  return (
    <div className="relative h-full overflow-hidden">
      <Suspense fallback={<LoadingFallback />}>
        <KanbanBoard />
      </Suspense>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
