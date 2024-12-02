import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Suspense, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { TaskDetail } from '@/pages/TaskDetail.tsx';
import { taskAPI } from '@/features/task/api.ts';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';

class InvalidTaskIdError extends Error {
  constructor(param: string) {
    super(`Invalid task ID provided: ${param}`);
  }
}

export const Route = createFileRoute('/_auth/$project/board/$task')({
  beforeLoad: ({ params: { task } }) => {
    const taskId = Number(task);
    if (Number.isNaN(taskId)) {
      throw new InvalidTaskIdError(task);
    }
  },
  loader: async ({ context: { queryClient }, params: { project, task } }) => {
    const projectId = Number(project);
    const taskId = Number(task);

    await queryClient.ensureQueryData({
      queryKey: ['task', taskId],
      queryFn: () => taskAPI.getDetail(taskId),
      staleTime: 5 * 60 * 1000,
    });

    return { projectId, taskId };
  },

  onLeave: ({ context: { queryClient }, params: { task } }) => {
    const taskId = Number(task);

    queryClient.invalidateQueries({
      queryKey: ['task', taskId],
    });
  },

  errorComponent: ErrorComponent,

  component: () => (
    <Suspense fallback={<div>Loading task details...</div>}>
      <TaskDetail />
    </Suspense>
  ),
});

export function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate({
    from: '/$project/board/$task',
  });

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      navigate({ to: '/$project/board' });
    }, 300);
  }, [navigate]);

  return (
    <AnimatePresence mode="wait" onExitComplete={() => setIsClosing(false)}>
      {!isClosing && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-30 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            key="panel"
            className="bg-surface fixed inset-y-0 right-0 z-40 w-full border-l md:w-2/3"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'stiffness',
              damping: 30,
              stiffness: 300,
            }}
          >
            <Card className="flex h-full items-center justify-center rounded-none border-none">
              <CardContent className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12" />
                <h2 className="mt-6 text-2xl font-semibold text-gray-900">Error Loading Task</h2>
                <p className="mt-2 text-gray-600">
                  {error.message || 'Failed to load task detail'}
                </p>
                <div className="mt-8 space-x-4">
                  <Button variant="outline" onClick={handleClose}>
                    Go Back
                  </Button>
                  <Button onClick={reset}>Try Again</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
