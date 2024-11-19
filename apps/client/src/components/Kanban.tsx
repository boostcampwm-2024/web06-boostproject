import { ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { HamburgerMenuIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { LexoRank } from 'lexorank';
import axios from 'axios';
import { useMutation, UseQueryResult } from '@tanstack/react-query';
import {
  Section,
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle,
} from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { TSection, TTask } from '@/types';
import TaskCard from '@/components/TaskCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/authContext';

interface KanbanProps {
  sections: TSection[];
  refetch: (options?: { throwOnError: boolean; cancelRefetch: boolean }) => Promise<UseQueryResult>;
}

interface CreateTaskPayload {
  event: 'CREATE_TASK';
  sectionId: number;
  position: string;
}

const calculateLastPosition = (tasks: TTask[]): string => {
  const lastTask = tasks[tasks.length - 1];
  return lastTask
    ? LexoRank.parse(lastTask.position).genNext().toString()
    : LexoRank.middle().toString();
};

export default function Kanban({ sections, refetch }: KanbanProps) {
  const { project: projectId } = useParams({ from: '/_auth/$project/board' });
  const { accessToken } = useAuth();

  const createTaskMutation = useMutation({
    mutationFn: async ({ sectionId, position }: Omit<CreateTaskPayload, 'event'>) => {
      const payload: CreateTaskPayload = {
        event: 'CREATE_TASK',
        sectionId,
        position,
      };

      return axios.post(`/api/project/${projectId}/update`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
    },
  });

  function handleCreateTask(sectionId: number) {
    const section = sections.find((section) => section.id === sectionId);
    if (!section) return;

    const position = calculateLastPosition(section.tasks);
    createTaskMutation.mutate({ sectionId, position });
  }

  return (
    <SectionWrapper>
      {sections.map((section) => (
        <Section key={section.id} className="flex h-full w-96 flex-shrink-0 flex-col bg-gray-50">
          <SectionHeader>
            <div className="flex items-center">
              <SectionTitle className="text-xl">{section.name}</SectionTitle>
              <SectionCounter>{section.tasks.length}</SectionCounter>
            </div>
            <SectionMenu>
              <Button
                type="button"
                variant="ghost"
                className="w-full border-none px-0 text-black"
                onClick={() => handleCreateTask(section.id)}
                disabled={createTaskMutation.isPending}
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
            </SectionMenu>
          </SectionHeader>
          <SectionContent className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {section.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SectionContent>
          <SectionFooter>
            <Button
              variant="ghost"
              className="w-full border-none px-0 text-black"
              onClick={() => handleCreateTask(section.id)}
              disabled={createTaskMutation.isPending}
            >
              <PlusIcon />
              태스크 추가
            </Button>
          </SectionFooter>
        </Section>
      ))}
      <Button type="button" variant="outline" className="h-full w-36" disabled>
        <PlusIcon />
        섹션 추가
      </Button>
    </SectionWrapper>
  );
}

function SectionWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-110px)] flex-1 flex-row space-x-2 overflow-x-auto p-4">
      {children}
    </div>
  );
}

function SectionCounter({ children }: { children: ReactNode }) {
  return (
    <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-lg border border-gray-400 text-gray-600">
      {children}
    </span>
  );
}

function SectionMenu({ children }: { children: ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" className="mt-0 p-0">
          <HamburgerMenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="gap-1 bg-white p-0">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
