import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';

import DetailSidebar from '@/details/SidebarInfo.tsx';
import { SubtaskComponent } from '@/features/task/subtask/components/Subtasks.tsx';
import { Subtask } from '@/features/task/subtask/types.ts';
import { TaskDescription } from '@/features/task/components/TaskDescription.tsx';

export function TaskDetail() {
  const navigate = useNavigate({ from: '/$project/board/$taskId' });
  const [isClosing, setIsClosing] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

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

  const handleAddSubtask = () => {
    const newId = Math.max(...subtasks.map((task) => task.id), 0) + 1;
    const newSubtask = {
      id: newId,
      content: 'New Subtask',
      completed: false,
      isNew: true,
    };
    setSubtasks((prev) => [...prev, newSubtask]);
  };

  const handleToggleSubtask = (id: number) => {
    setSubtasks((prevSubtasks) =>
      prevSubtasks.map((subtask) =>
        subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
      )
    );
  };

  const handleUpdateSubtask = (id: number, newContent: string) => {
    if (newContent.trim() === '') {
      handleDeleteSubtask(id);
      return;
    }
    setSubtasks((prevSubtasks) =>
      prevSubtasks.map((subtask) =>
        subtask.id === id ? { ...subtask, content: newContent, isNew: false } : subtask
      )
    );
  };

  const handleDeleteSubtask = (id: number) => {
    setSubtasks((prevSubtasks) => prevSubtasks.filter((subtask) => subtask.id !== id));
  };

  const subtasksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subtasksRef.current) {
      subtasksRef.current.scrollTop = subtasksRef.current.scrollHeight;
    }
  }, [subtasks.length]); // subtasks 길이가 변경될 때만 실행

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
            className="bg-surface fixed inset-y-0 right-0 z-50 w-full border-l md:w-2/3"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
          >
            <Card className="h-full rounded-none border-none">
              <CardHeader className="bg-blue sticky top-0 z-40 h-[100px] backdrop-blur">
                <div className="flex h-full items-center justify-between">
                  <h2 className="text-3xl font-semibold">Make Project Bigger</h2>
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="mt-4 grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6 pr-4">
                  <TaskDescription initialDescription="" />

                  <div>
                    <h3 className="mb-2 text-lg font-medium">Subtasks</h3>
                    <div className="max-h-96 space-y-0.5 overflow-y-auto" ref={subtasksRef}>
                      {subtasks.map((subtask) => (
                        <SubtaskComponent
                          key={subtask.id}
                          subtask={subtask}
                          onToggle={handleToggleSubtask}
                          onUpdate={handleUpdateSubtask}
                          onDelete={handleDeleteSubtask}
                        />
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddSubtask}
                      className="mt-2 w-full text-xs"
                    >
                      + Add New Subtask
                    </Button>
                  </div>
                </div>

                <DetailSidebar />
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
