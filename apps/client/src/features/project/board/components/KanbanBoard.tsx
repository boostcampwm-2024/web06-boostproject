import { DragEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card.tsx';
import { cn } from '@/lib/utils.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { useToast } from '@/lib/useToast.tsx';
import { useBoardMutations } from '@/features/project/board/useBoardMutations.ts';
import { AssigneeAvatars } from '@/features/project/board/components/AssigneeAvatars.tsx';
import { calculatePosition, findDiff, findTask } from '@/features/project/board/utils.ts';
import { TaskTextarea } from '@/features/project/board/components/TaskTextarea.tsx';
import { useBoardStore } from '@/features/project/board/useBoardStore.ts';
import { SubtaskProgress } from '@/features/project/board/components/SubtaskProgress.tsx';
import { useDragAndDrop } from '@/features/project/board/useDragAndDrop.ts';
import { BoardSection } from '@/features/project/board/components/KanbanSection.tsx';

interface KanbanBoardProps {
  projectId: number;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { sections, updateTaskPosition, updateTaskTitle, restoreState } = useBoardStore();

  const toast = useToast();
  const mutations = useBoardMutations(projectId);

  const onDrop = (sectionId: number, taskId: number) => {
    const targetSection = sections.find((section) => section.id === sectionId);
    if (!targetSection) return;

    const position =
      belowTaskId === -1
        ? calculatePosition(targetSection.tasks, -1)
        : calculatePosition(targetSection.tasks, belowTaskId);

    const previousSections = [...sections];

    updateTaskPosition(sectionId, taskId, position);

    mutations.updatePosition.mutate(
      {
        event: 'UPDATE_POSITION',
        sectionId,
        taskId,
        position,
      },
      {
        onError: () => {
          restoreState(previousSections);
          toast.error('Failed to update task position');
        },
      }
    );
  };

  const {
    belowSectionId,
    belowTaskId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop(onDrop);

  const handleTitleChange = (taskId: number, newTitle: string) => {
    const task = findTask(sections, taskId);
    if (!task) return;

    const diff = findDiff(task.title, newTitle);

    if (diff.originalContent.length > 0) {
      mutations.updateTitle.mutate(
        {
          event: 'DELETE_TITLE',
          taskId,
          title: {
            position: diff.position,
            content: diff.originalContent,
            length: diff.originalContent.length,
          },
        },
        {
          onSuccess: () => {
            if (diff.content.length > 0) {
              mutations.updateTitle.mutate({
                event: 'INSERT_TITLE',
                taskId,
                title: {
                  position: diff.position,
                  content: diff.content,
                  length: diff.content.length,
                },
              });
            }
          },
        }
      );
    } else if (diff.content.length > 0) {
      mutations.updateTitle.mutate({
        event: 'INSERT_TITLE',
        taskId,
        title: {
          position: diff.position,
          content: diff.content,
          length: diff.content.length,
        },
      });
    }

    updateTaskTitle(taskId, newTitle);
  };

  return (
    <div className="spazce-x-2 flex h-[calc(100vh-110px)] gap-2 overflow-x-auto p-4">
      <AnimatePresence mode="popLayout">
        {sections.map((section) => (
          <BoardSection
            key={section.id}
            section={section}
            isBelow={section.id === belowSectionId}
            onDrop={(e) => handleDrop(e, section.id)}
            onDragOver={(e) => handleDragOver(e, section.id)}
          >
            {section.tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                layoutId={task.id.toString()}
                draggable
                initial={{ opacity: 1, zIndex: 1 }}
                animate={{
                  zIndex: task.id === belowTaskId ? 50 : 1,
                  scale: task.id === belowTaskId ? 1.02 : 1,
                }}
                transition={{
                  layout: { duration: 0.3 },
                  scale: { duration: 0.2 },
                }}
                style={{ position: 'relative' }}
                onDragStart={(e) => handleDragStart(e as unknown as DragEvent, section.id, task.id)}
                onDrop={(e) => handleDrop(e, section.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDragOver(e, section.id, task.id);
                }}
                onDragLeave={handleDragLeave}
              >
                <Card
                  className={cn(
                    'w-56 border bg-white transition-all duration-300 md:w-80',
                    task.id === belowTaskId && 'border-2 border-blue-400',
                    'hover:shadow-md'
                  )}
                >
                  <CardHeader className="flex flex-row items-start gap-2 space-y-0">
                    <TaskTextarea
                      taskId={task.id}
                      initialTitle={task.title}
                      onTitleChange={handleTitleChange}
                    />
                    <Button
                      variant="ghost"
                      type="button"
                      asChild
                      className="hover:text-primary px-2 hover:bg-transparent"
                    >
                      <Link to={`/${projectId}/board/${task.id}`} className="p-0">
                        <PanelLeftOpen className="h-6 w-6" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="flex items-end justify-between">
                    <div className="flex flex-wrap gap-1">
                      {task.labels.map((label) => (
                        <Badge key={label.id} style={{ backgroundColor: label.color }}>
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                    <AssigneeAvatars assignees={task.assignees} />
                  </CardContent>
                  {task.subtasks.total > 0 && (
                    <CardFooter className="flex items-center justify-between space-y-0">
                      <SubtaskProgress
                        total={task.subtasks.total}
                        completed={task.subtasks.completed}
                      />
                    </CardFooter>
                  )}
                </Card>
              </motion.div>
            ))}
          </BoardSection>
        ))}
      </AnimatePresence>
    </div>
  );
}
