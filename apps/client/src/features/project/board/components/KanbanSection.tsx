import { ReactNode, DragEvent } from 'react';

import { HamburgerMenuIcon, PlusIcon } from '@radix-ui/react-icons';
import { useLoaderData } from '@tanstack/react-router';
import {
  Section,
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle,
} from '@/components/ui/section.tsx';
import { Section as TSection } from '@/features/project/board/types.ts';
import { cn } from '@/lib/utils.ts';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { calculatePosition } from '@/features/project/board/utils.ts';
import { useToast } from '@/lib/useToast.tsx';
import { useBoardStore } from '@/features/project/board/useBoardStore.ts';
import { useBoardMutations } from '@/features/project/board/useBoardMutations.ts';

interface BoardSectionProps {
  section: TSection;
  isBelow: boolean;
  onDrop: (e: DragEvent<HTMLElement>) => void;
  onDragOver: (e: DragEvent<HTMLElement>) => void;
  children: ReactNode;
}

export function BoardSection({
  section,
  isBelow,
  onDrop,
  onDragOver,
  children,
}: BoardSectionProps) {
  const { projectId } = useLoaderData({
    from: '/_auth/$project/board',
  });

  const toast = useToast();

  const { createTask } = useBoardStore();

  const {
    createTask: { mutate: createTaskMutate },
  } = useBoardMutations(projectId);

  const handleCreateTask = () => {
    const position = calculatePosition(section.tasks, -1);

    createTaskMutate(
      {
        event: 'CREATE_TASK',
        sectionId: section.id,
        position,
      },
      {
        onSuccess: (response) => {
          createTask(section.id, {
            id: response.id,
            title: '',
            sectionId: section.id,
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
    <Section
      className={cn(
        'flex h-full w-[352px] flex-shrink-0 flex-col items-center',
        'bg-transparent',
        isBelow && 'border-2 border-blue-400'
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
            className="hover:text-primary w-full border-none px-0 text-black hover:bg-white"
            onClick={handleCreateTask}
          >
            <PlusIcon />
            Add Task
          </Button>
        </SectionDropdownMenu>
      </SectionHeader>

      <SectionContent
        key={section.id}
        className="flex w-full flex-1 flex-col items-center gap-2 overflow-y-auto pt-1"
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {children}
      </SectionContent>
      <SectionFooter className="w-full">
        <Button
          variant="ghost"
          className="w-full border-none px-0 text-black"
          onClick={handleCreateTask}
        >
          <PlusIcon />
          Add Task
        </Button>
      </SectionFooter>
    </Section>
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
