import { ReactNode, useEffect, useState, DragEvent, useCallback } from 'react';
import { Link, useLoaderData } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { HamburgerMenuIcon, PlusIcon } from '@radix-ui/react-icons';
import { PanelLeftOpen } from 'lucide-react';
import { AxiosError } from 'axios';
import {
  Section as TSection,
  Task,
  TaskEvent,
  TaskEventType,
} from '@/features/project/board/types.ts';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { cn } from '@/lib/utils.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { boardAPI } from '@/features/project/board/api.ts';
import { useToast } from '@/lib/useToast.tsx';
import { useBoardMutations } from '@/features/project/board/useBoardMutations.ts';
import { throttle } from '@/shared/utils/throttle.ts';
import { AssigneeAvatars } from '@/features/project/board/components/AssigneeAvatars.tsx';
import { calculatePosition, findDiff, findTask } from '@/features/project/board/utils.ts';
import { TaskTextarea } from '@/features/project/board/components/TaskTextarea.tsx';

export function Board() {
  const { projectId, sections: initialSections } = useLoaderData({
    from: '/_auth/$project/board',
  });

  const toast = useToast();
  const { createTask, updatePosition, updateTitle } = useBoardMutations(projectId);
  const [sections, setSections] = useState<TSection[]>(initialSections);
  const [belowSectionId, setBelowSectionId] = useState<number>(-1);
  const [belowTaskId, setBelowTaskId] = useState<number>(-1);

  const handleEvent = useCallback((event: TaskEvent) => {
    setSections((currentSections) => {
      const handleTaskCreated = (sections: TSection[]): TSection[] => {
        return sections.map((section) =>
          section.id === event.task.sectionId
            ? {
                ...section,
                tasks: [
                  ...section.tasks,
                  {
                    id: event.task.id,
                    title: event.task.title ?? '',
                    sectionId: event.task.sectionId!,
                    position: event.task.position!,
                    assignees: event.task.assignees ?? [],
                    labels: event.task.labels ?? [],
                    subtasks: event.task.subtasks ?? { total: 0, completed: 0 },
                  } as Task,
                ],
              }
            : section
        );
      };

      const handlePositionUpdated = (sections: TSection[]): TSection[] => {
        const task = findTask(sections, event.task.id);
        if (!task) return sections;

        return sections.map((section) => {
          if (section.id === task.sectionId) {
            return {
              ...section,
              tasks: section.tasks.filter((t) => t.id !== task.id),
            };
          }

          if (section.id === event.task.sectionId) {
            return {
              ...section,
              tasks: [
                ...section.tasks,
                {
                  ...task,
                  sectionId: event.task.sectionId!,
                  position: event.task.position!,
                },
              ],
            };
          }

          return section;
        });
      };

      const handleTaskUpdated = (sections: TSection[]): TSection[] => {
        return sections.map((section) => ({
          ...section,
          tasks: section.tasks.map((task) =>
            task.id === event.task.id ? ({ ...task, ...event.task } as Task) : task
          ),
        }));
      };

      const handleTaskDeleted = (sections: TSection[]): TSection[] => {
        return sections.map((section) => ({
          ...section,
          tasks: section.tasks.filter((task) => task.id !== event.task.id),
        }));
      };

      let updatedSections = currentSections;

      switch (event.event) {
        case TaskEventType.TASK_CREATED:
          updatedSections = handleTaskCreated(currentSections);
          break;

        case TaskEventType.POSITION_UPDATED:
          updatedSections = handlePositionUpdated(currentSections);
          break;

        case TaskEventType.TITLE_UPDATED:
          updatedSections = handleTaskUpdated(currentSections);
          break;

        case TaskEventType.TASK_DELETED:
          updatedSections = handleTaskDeleted(currentSections);
          break;

        case TaskEventType.ASSIGNEES_CHANGED:
        case TaskEventType.LABELS_CHANGED:
        case TaskEventType.SUBTASKS_CHANGED:
          updatedSections = handleTaskUpdated(currentSections);
          break;

        default:
          break;
      }

      return updatedSections.map((section) => ({
        ...section,
        tasks: [...section.tasks].sort((a, b) => a.position.localeCompare(b.position)),
      }));
    });
  }, []);

  const handleTitleChange = useCallback(
    (taskId: number, newTitle: string) => {
      setSections((currentSections) => {
        const task = findTask(currentSections, taskId);
        if (!task) return currentSections;

        const diff = findDiff(task.title, newTitle);

        // 삭제된 내용이 있는 경우
        if (diff.originalContent.length > 0) {
          updateTitle.mutate(
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
                // 새로운 내용이 있는 경우에만 삽입
                if (diff.content.length > 0) {
                  updateTitle.mutate({
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
          updateTitle.mutate({
            event: 'INSERT_TITLE',
            taskId,
            title: {
              position: diff.position,
              content: diff.content,
              length: diff.content.length,
            },
          });
        }

        // 자기가 발생시킨 업데이트에 대한 로컬 상태 관리
        return currentSections.map((section) => ({
          ...section,
          tasks: section.tasks.map((t) => (t.id === taskId ? { ...t, title: newTitle } : t)),
        }));
      });
    },
    [updateTitle]
  );

  useEffect(() => {
    let timeoutId: number;
    const controller = new AbortController();
    let isPolling = false;
    let isStopped = false;

    let retryCount = 0;
    const MAX_RETRY_COUNT = 5;
    const POLLING_INTERVAL = 500;

    const pollEvent = async () => {
      if (isPolling || isStopped) return;

      try {
        isPolling = true;

        const event = await boardAPI.getEvent(projectId, {
          signal: controller.signal,
        });

        if (event) {
          handleEvent(event);
          retryCount = 0;
        }
      } catch (error) {
        retryCount += 1;

        if ((error as AxiosError).status === 404) {
          retryCount = 0;
        }

        if (retryCount >= MAX_RETRY_COUNT) {
          toast.error('Failed to poll event. Please refresh the page.', 5000);
          isStopped = true;
          controller.abort();
          clearTimeout(timeoutId);
          return;
        }
      } finally {
        isPolling = false;
        if (!isStopped) {
          timeoutId = setTimeout(pollEvent, POLLING_INTERVAL);
        }
      }
    };

    timeoutId = setTimeout(pollEvent, POLLING_INTERVAL);

    return () => {
      isStopped = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [projectId, handleEvent, toast]);

  const handleDragStart = (event: DragEvent<HTMLDivElement>, sectionId: number, taskId: number) => {
    event.dataTransfer.setData('taskId', taskId.toString());
    event.dataTransfer.setData('sectionId', sectionId.toString());
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, sectionId: number, taskId?: number) => {
    e.preventDefault();
    setBelowSectionId(sectionId);

    if (!taskId) {
      setBelowTaskId(-1);
      return;
    }

    setBelowTaskId(taskId);
  };

  const handleDragLeave = () => {
    setBelowTaskId(-1);
    setBelowSectionId(-1);
  };

  const throttledDragLeave = throttle(handleDragLeave);

  const handleDragEnd = () => {
    setBelowTaskId(-1);
    setBelowSectionId(-1);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, sectionId: number) => {
    event.stopPropagation();
    event.preventDefault();

    const taskId = Number(event.dataTransfer.getData('taskId'));
    const fromSectionId = Number(event.dataTransfer.getData('sectionId'));

    if (taskId === belowTaskId) {
      setBelowTaskId(-1);
      setBelowSectionId(-1);
      return;
    }

    const targetSection = sections.find((section) => section.id === sectionId);
    if (!targetSection) return;

    // Calculate position based on whether we're dropping on a task or section
    const position =
      belowTaskId === -1
        ? calculatePosition(targetSection.tasks, -1) // Drop at the end of section
        : calculatePosition(targetSection.tasks, belowTaskId);

    const previousSections = [...sections];

    setSections((currentSections) => {
      const task = findTask(currentSections, taskId);
      if (!task) return currentSections;

      const updatedTask = {
        ...task,
        position,
        sectionId, // Update the sectionId when moving between sections
      };

      return currentSections.map((section) => {
        // Remove from source section
        if (section.id === fromSectionId) {
          return {
            ...section,
            tasks: section.tasks.filter((t) => t.id !== taskId),
          };
        }

        // Add to target section
        if (section.id === sectionId) {
          const updatedTasks = [...section.tasks];
          if (belowTaskId === -1) {
            // Append to the end if dropping on section
            updatedTasks.push(updatedTask);
          } else {
            // Insert at specific position if dropping on a task
            const targetIndex = updatedTasks.findIndex((t) => t.id === belowTaskId);
            updatedTasks.splice(targetIndex, 0, updatedTask);
          }

          return {
            ...section,
            tasks: updatedTasks.sort((a, b) => a.position.localeCompare(b.position)),
          };
        }

        return section;
      });
    });

    setBelowTaskId(-1);
    setBelowSectionId(-1);

    updatePosition.mutate(
      {
        event: 'UPDATE_POSITION',
        sectionId,
        taskId,
        position,
      },
      {
        onError: () => {
          setSections(previousSections);
          toast.error('Failed to update task position');
        },
      }
    );
  };

  const handleCreateTask = (sectionId: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const position = calculatePosition(section.tasks, -1);

    createTask.mutate(
      {
        event: 'CREATE_TASK',
        sectionId,
        position,
      },
      {
        onSuccess: (response) => {
          setSections((currentSections) =>
            currentSections.map((section) => {
              if (section.id === sectionId) {
                return {
                  ...section,
                  tasks: [
                    ...section.tasks,
                    {
                      id: response.id,
                      title: '',
                      sectionId,
                      position,
                      assignees: [],
                      labels: [],
                      subtasks: { total: 0, completed: 0 },
                    },
                  ].sort((a, b) => a.position.localeCompare(b.position)),
                };
              }
              return section;
            })
          );
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
            onDragOver={(e) => handleDragOver(e, section.id)}
            onDrop={(e) => handleDrop(e, section.id)}
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
                  태스크 추가
                </Button>
              </SectionDropdownMenu>
            </SectionHeader>
            <SectionContent
              key={section.id}
              className="flex flex-1 flex-col gap-2 overflow-y-auto pt-1"
              onDragOver={(e) => handleDragOver(e, section.id)}
              onDragLeave={throttledDragLeave}
              onDrop={(e) => handleDrop(e, section.id)}
              onDragEnd={handleDragEnd}
            >
              {section.tasks
                .sort((a, b) => a.position.localeCompare(b.position))
                .map((task) => (
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
                      handleDragStart(
                        e as unknown as DragEvent<HTMLDivElement>,
                        section.id,
                        task.id
                      )
                    }
                    onDrop={(e) => handleDrop(e, section.id)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDragOver(e, section.id, task.id);
                    }}
                    onDragLeave={throttledDragLeave}
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
                태스크 추가
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
