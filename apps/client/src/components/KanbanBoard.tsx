import { Link, useParams } from '@tanstack/react-router';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LexoRank } from 'lexorank';
import { HamburgerMenuIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { DragEvent, useState } from 'react';
import { PanelLeftOpen } from 'lucide-react';

import {
  Section,
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle,
} from '@/components/ui/section.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import Tag from '@/components/Tag.tsx';
import TaskTextArea from '@/components/TaskTextArea.tsx';
import { axiosInstance } from '@/lib/axios.ts';

export interface Event {
  taskId: number;
  taskEvent: string;
}

export type Task = {
  id: number;
  title: string;
  description: string;
  position: string;
};

export type Section = {
  id: number;
  name: string;
  tasks: Task[];
};

type BaseResponse<T> = {
  status: number;
  message: string;
  result: T;
};

export type TasksResponse = BaseResponse<Section[]>;
export type EventResponse = BaseResponse<Event>;

export default function KanbanBoard() {
  const { project: projectId } = useParams({ from: '/_auth/$project/board' });
  const queryClient = useQueryClient();

  // load tasks
  const { data: sections } = useSuspenseQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await axiosInstance.get<TasksResponse>(`/task?projectId=${projectId}`);

      return response.data.result;
    },
  });

  // useEffect(() => {
  //   const ac = new AbortController();
  //   let timeoutId: number;
  //
  //   const fetchEvent = async () => {
  //     try {
  //       const response = await axios.get<EventResponse>(`/api/event?projectId=${projectId}`, {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //         signal: ac.signal,
  //       });
  //
  //       const { taskId, taskEvent } = response.data.result;
  //
  //       if (!taskId) {
  //         return;
  //       }
  //
  //       if (taskEvent === 'TITLE') {
  //         queryClient.invalidateQueries({
  //           queryKey: ['task-detail', taskId],
  //         });
  //       }
  //
  //       if (taskEvent === 'CARD') {
  //         queryClient.invalidateQueries({
  //           queryKey: ['tasks', projectId],
  //         });
  //       }
  //     } catch (error) {
  //       if (axios.isCancel(error)) {
  //         console.error('Request canceled:', error.message);
  //       } else {
  //         console.error(error);
  //       }
  //     }
  //
  //     timeoutId = window.setTimeout(fetchEvent, 500);
  //   };
  //
  //   fetchEvent();
  //
  //   return () => {
  //     window.clearTimeout(timeoutId);
  //     ac.abort();
  //   };
  // }, [projectId, accessToken, queryClient]);
  // create Task
  const { mutate: createTask } = useMutation({
    mutationFn: async ({ sectionId, position }: { sectionId: number; position: string }) => {
      const payload = {
        event: 'CREATE_TASK',
        sectionId,
        position,
      };

      return axiosInstance.post(`/project/${projectId}/update`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
      });
    },
    onError: (error) => {
      console.error('createTaskError', error);
    },
  });

  const calculateLastPosition = (tasks: Task[]): string => {
    const lastTask = tasks[tasks.length - 1];
    return lastTask
      ? LexoRank.parse(lastTask.position).genNext().toString()
      : LexoRank.middle().toString();
  };

  const handleCreateButtonClick = (sectionId: number, tasks: Task[]) => {
    const position = calculateLastPosition(tasks);
    createTask({ sectionId, position });
  };

  // delete Task
  // const { mutate: deleteTask } = useMutation({
  //   mutationFn: async (taskId: number) => {
  //     const payload = {
  //       event: 'DELETE_TASK',
  //       taskId,
  //     };
  //
  //     return axios.post(`/api/project/${projectId}/update`, payload, {
  //       headers: { Authorization: `Bearer ${accessToken}` },
  //     });
  //   },
  //   onSuccess: async () => {
  //     await queryClient.invalidateQueries({
  //       queryKey: ['tasks', projectId],
  //     });
  //   },
  //   onError: (error) => {
  //     console.error('createTaskError', error);
  //   },
  // });

  // const handleDeleteButtonClick = (taskId: number) => {
  //   deleteTask(taskId);
  // };

  // drag&drop
  const [belowSectionId, setBelowSectionId] = useState(-1);
  const [belowTaskId, setBelowTaskId] = useState(-1);

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

  const calculatePosition = (tasks: Task[], belowTaskId: number) => {
    if (tasks.length === 0) {
      // 빈 섹션이라면 랜덤 값 부여.
      return LexoRank.middle().toString();
    }

    if (belowTaskId === -1) {
      // 특정 태스크 위에 드랍하지 않은 경우
      return LexoRank.parse(tasks[tasks.length - 1].position)
        .genNext()
        .toString();
    }

    const belowTaskIndex = tasks.findIndex((task) => task.id === belowTaskId);
    const belowTask = tasks[belowTaskIndex];

    if (belowTaskIndex === 0) {
      // 첫 번째 태스크 위에 드랍한 경우
      return LexoRank.parse(belowTask.position).genPrev().toString();
    }

    return LexoRank.parse(tasks[belowTaskIndex - 1].position)
      .between(LexoRank.parse(belowTask.position))
      .toString();
  };

  const { mutate: updateTaskPosition } = useMutation({
    mutationFn: async ({
      sectionId,
      taskId,
      position,
    }: {
      sectionId: number;
      taskId: number;
      position: string;
    }) => {
      const payload = {
        event: 'UPDATE_POSITION',
        sectionId,
        taskId,
        position,
      };

      return axiosInstance.post(`/project/${projectId}/update`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['tasks', projectId],
      });
    },
    onError: (error) => {
      console.error('Failed to update task position:', error);
    },
    onSettled: () => {
      setBelowSectionId(-1);
      setBelowTaskId(-1);
    },
  });

  const handleDrop = (event: DragEvent<HTMLDivElement>, sectionId: number) => {
    const taskId = Number(event.dataTransfer.getData('taskId'));

    if (taskId === belowTaskId) {
      setBelowTaskId(-1);
      setBelowSectionId(-1);
      return;
    }

    updateTaskPosition({
      sectionId,
      taskId,
      position: calculatePosition(
        sections.find((section) => section.id === sectionId)?.tasks || [],
        belowTaskId
      ),
    });
  };

  // render
  const sortedSections = sections.map((section) => {
    section.tasks.sort((a, b) => a.position.localeCompare(b.position));
    return section;
  });

  // to detail page

  return (
    <div className="spazce-x-2 flex h-[calc(100vh-110px)] gap-2 overflow-x-auto p-4">
      {sortedSections.map((section) => (
        <Section
          key={section.id}
          className={`flex h-full w-96 flex-shrink-0 flex-col border bg-gray-50 ${section.id === belowSectionId ? 'border-blue-600' : 'border-transparent'}`}
        >
          <SectionHeader>
            <div className="flex items-center">
              <SectionTitle className="text-xl">{section.name}</SectionTitle>
              <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-lg border border-gray-400 text-gray-600">
                {section.tasks.length}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="mt-0 p-0">
                  <HamburgerMenuIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="gap-1 bg-white p-0">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full border-none px-0 text-black"
                  onClick={() => handleCreateButtonClick(section.id, section.tasks)}
                >
                  <PlusIcon />
                  태스크 추가
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="hover:text-destructive w-full border-none bg-white px-0 text-black"
                  disabled
                >
                  <TrashIcon />
                  섹션 삭제
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          </SectionHeader>
          <SectionContent
            className="flex flex-1 flex-col gap-2 overflow-y-auto"
            onDragOver={(e) => handleDragOver(e, section.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section.id)}
          >
            {section.tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                layoutId={task.id.toString()}
                draggable
                onDragStart={(e) =>
                  handleDragStart(e as unknown as DragEvent<HTMLDivElement>, section.id, task.id)
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
                  className={`border bg-white transition-all duration-300 ${task.id === belowTaskId ? 'border-blue-500' : 'border-transparent'}`}
                >
                  <CardHeader className="flex flex-row items-start gap-2">
                    <TaskTextArea taskId={task.id} initialTitle={task.title} />
                    <Button
                      variant="ghost"
                      type="button"
                      asChild
                      // onClick={() => handleDeleteButtonClick(task.id)}
                    >
                      <Link to={`/${projectId}/board/${task.id}`}>
                        <PanelLeftOpen />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="flex gap-1">
                    <Tag text="Feature" />
                    <Tag text="FE" className="bg-pink-400" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </SectionContent>
          <SectionFooter>
            <Button
              variant="ghost"
              className="w-full border-none px-0 text-black"
              onClick={() => handleCreateButtonClick(section.id, section.tasks)}
            >
              <PlusIcon />
              태스크 추가
            </Button>
          </SectionFooter>
        </Section>
      ))}
      <Dialog>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>문제가 발생했어요</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-gray-600">{null}</p>
          <DialogFooter>
            <Button variant="default">확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      ;
    </div>
  );
}
