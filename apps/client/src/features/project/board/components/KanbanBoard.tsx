import { ReactNode, DragEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { HamburgerMenuIcon, PlusIcon } from '@radix-ui/react-icons';
import { PanelLeftOpen } from 'lucide-react';

import {
  Section,
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle,
} from '@/components/ui/section.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
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

interface KanbanBoardProps {
  projectId: number;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { sections, updateTaskPosition, updateTaskTitle, createTask, restoreState } =
    useBoardStore();

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
    handleDragEnd,
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

  const handleCreateTask = (sectionId: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const position = calculatePosition(section.tasks, -1);

    mutations.createTask.mutate(
      {
        event: 'CREATE_TASK',
        sectionId,
        position,
      },
      {
        onSuccess: (response) => {
          createTask(sectionId, {
            id: response.id,
            title: '',
            sectionId,
            position,
            assignees: [],
            labels: [],
            subtasks: { total: 0, completed: 0 },
          });
        },
        onError: () => {
          toast.error('Failed to create task');
        },
      }
    );
  };

  return (
    <div className="spazce-x-2 flex h-[calc(100vh-110px)] gap-2 overflow-x-auto p-4">
      <AnimatePresence mode="popLayout">
        {sections.map((section) => (
          <Section
            key={section.id}
            className={cn(
              'flex h-full w-[352px] flex-shrink-0 flex-col items-center',
              'bg-transparent',
              section.id === belowSectionId && belowTaskId === -1 && 'border-2 border-blue-400'
            )}
          >
            <SectionHeader className="flex w-full items-center justify-between gap-2 space-y-0">
              <div className="flex items-center gap-2">
                <SectionTitle className="text-xl">{section.name}</SectionTitle>
                <SectionCount>{section.tasks.length}</SectionCount>
              </div>
              <SectionDropdownMenu>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-blac hover:text-primary w-full border-none px-0 hover:bg-white"
                  onClick={() => handleCreateTask(section.id)}
                >
                  <PlusIcon />
                  Add Task
                </Button>
              </SectionDropdownMenu>
            </SectionHeader>
            <SectionContent
              key={section.id}
              className="flex w-full flex-1 flex-col items-center gap-2 overflow-y-auto pt-1"
              onDragOver={(e) => handleDragOver(e, section.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, section.id)}
              onDragEnd={handleDragEnd}
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
                  onDragStart={(e) =>
                    handleDragStart(e as unknown as DragEvent, section.id, task.id)
                  }
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
            </SectionContent>
            <SectionFooter className="w-full">
              <Button
                variant="ghost"
                className="w-full border-none px-0 text-black"
                onClick={() => handleCreateTask(section.id)}
              >
                <PlusIcon />
                Add Task
              </Button>
            </SectionFooter>
          </Section>
        ))}
      </AnimatePresence>
    </div>
  );
}

function SectionCount({ children }: { children: ReactNode }) {
  return (
    <span className="mt-0 flex h-6 w-6 items-center justify-center rounded-lg border border-gray-400 text-gray-600">
      {children}
    </span>
  );
}

function SectionDropdownMenu({ children }: { children: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" className="hover:text-primary h-6 w-6 hover:bg-transparent">
          <HamburgerMenuIcon className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="gap-1 bg-white p-0">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
