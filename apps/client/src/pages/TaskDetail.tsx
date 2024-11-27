import { Suspense, useCallback, useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { TrashIcon } from '@radix-ui/react-icons';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';

import { TaskDescription } from '@/features/task/components/TaskDescription.tsx';
import { Subtasks } from '@/features/task/subtask/components/Subtasks.tsx';
import { useSuspenseTaskQuery } from '@/features/task/useSuspenseTaskQuery.ts';
import Assignees from '@/features/task/components/Assignees.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import Labels from '@/features/task/components/Labels.tsx';
import Priority from '@/features/task/components/Priority.tsx';
import Sprint from '@/features/task/components/Sprint.tsx';
import Estimate from '@/features/task/components/Estimate.tsx';
import { useTaskMutations } from '@/features/task/useTaskMutations.ts';

export function TaskDetail() {
  const { taskId } = useLoaderData({ from: '/_auth/$project/board/$taskId' });

  const navigate = useNavigate({ from: '/$project/board/$taskId' });

  const [isClosing, setIsClosing] = useState(false);

  const { data: task } = useSuspenseTaskQuery(taskId);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = useCallback(async () => {
    setIsClosing(true);
    setTimeout(() => {
      navigate({ to: '/$project/board' });
    }, 300);
  }, [navigate]);

  const { deleteTask } = useTaskMutations(taskId);

  const handleDelete = useCallback(() => {
    deleteTask.mutate();
    navigate({ to: '/$project/board' });
  }, [deleteTask, navigate]);

  return (
    <AnimatePresence key={taskId} mode="wait" onExitComplete={() => setIsClosing(false)}>
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
            className="bg-surface fixed inset-y-0 right-0 z-50 w-full border-l md:w-2/3"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'stiffness',
              damping: 30,
              stiffness: 300,
            }}
          >
            <Card className="h-full rounded-none border-none">
              <CardHeader className="bg-blue sticky top-0 z-40 h-[100px] backdrop-blur">
                <div className="flex h-full items-center justify-between">
                  <h2 className="line-clamp-2 max-w-sm break-words text-3xl font-semibold lg:max-w-xl">
                    {task.title}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="mt-4 grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6 pr-4">
                  <TaskDescription initialDescription={task.description} />
                  <Subtasks initialSubtasks={task.subtasks} />
                </div>

                <div className="space-y-5 pb-4">
                  <Suspense fallback={<div>loading assignees</div>}>
                    <Assignees initialAssignees={task.assignees} />
                  </Suspense>
                  <Separator className="rounded-full bg-gray-300" />

                  <Suspense fallback={<div>loading labels</div>}>
                    <Labels initialLabels={task.labels} />
                  </Suspense>
                  <Separator className="rounded-full bg-gray-300" />

                  <Priority initialPriority={task.priority} />
                  <Separator className="rounded-full bg-gray-300" />

                  <Suspense fallback={<div>loading sprints</div>}>
                    <Sprint initialSprint={task.sprint} />
                  </Suspense>
                  <Separator className="rounded-full bg-gray-300" />

                  <Estimate initialEstimate={task.estimate} />
                  <Separator className="rounded-full bg-gray-300" />

                  <div>
                    <Button
                      variant="ghost"
                      className="m-0 p-0 px-2 font-medium text-gray-500 hover:text-red-600"
                      onClick={handleDelete}
                    >
                      <TrashIcon className="h-5 w-5" />
                      <span className="text-xs">Delete task</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
