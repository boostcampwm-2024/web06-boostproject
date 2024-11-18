import { Suspense } from 'react';
import KanbanContainer from '@/components/KanbanContainer.tsx';

export default function Board() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KanbanContainer />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  );
}
