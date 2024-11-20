import { useParams } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LexoRank } from 'lexorank';
import { HamburgerMenuIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { useEffect } from 'react';

import { useAuth } from '@/contexts/authContext.tsx';
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

export interface Event {
  taskId: number;
  event: string;
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

type TasksResponse = BaseResponse<Section[]>;
type EventResponse = BaseResponse<Event>;

export default function KanbanBoard() {
  const { project: projectId } = useParams({ from: '/_auth/$project/board' });
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  // load tasks
  const { data: sections } = useSuspenseQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await axios.get<TasksResponse>(`/api/task?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data.result;
    },
  });

  // polling events
  const { status, refetch: refetchEvents } = useQuery({
    queryKey: ['events', projectId],
    queryFn: async () => {
      const response = await axios.get<EventResponse>(`/api/event?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return response.data.result;
    },
    retry: false,
  });

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      refetchEvents();
    }
  }, [status]);

  // create Task
  const { mutate: createTask } = useMutation({
    mutationFn: async ({ sectionId, position }: { sectionId: number; position: string }) => {
      const payload = {
        event: 'CREATE_TASK',
        sectionId,
        position,
      };

      return axios.post(`/api/project/${projectId}/update`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
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

  const sortedSections = sections.map((section) => {
    section.tasks.sort((a, b) => a.position.localeCompare(b.position));
    return section;
  });

  return (
    <div className="flex h-[calc(100vh-110px)] space-x-2 overflow-x-auto p-4">
      {sortedSections.map((section) => (
        <Section key={section.id} className="flex h-full w-96 flex-shrink-0 flex-col bg-gray-50">
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
          <SectionContent className="flex flex-1 flex-col overflow-y-auto">
            {section.tasks.map((task) => (
              <motion.div key={task.id} layout layoutId={task.id.toString()} draggable>
                <div
                  className={`my-1 h-1 w-full rounded-full bg-blue-500 ${false ? 'opacity-100' : 'opacity-0'} transition-all`}
                />
                <Card className="bg-white transition-all duration-300">
                  <CardHeader className="flex flex-row items-start gap-2">
                    <input
                      type="text"
                      value={task.title}
                      className="text-md mt-1.5 flex flex-1 break-keep"
                    />
                    <div className="mt-0 inline-flex h-8 w-8 rounded-full bg-amber-200" />
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
    </div>
  );
}
