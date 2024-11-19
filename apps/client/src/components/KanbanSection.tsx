import { ReactNode } from 'react';
import { HamburgerMenuIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import {
  Section,
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle,
} from '@/components/ui/section';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TSection } from '@/types';

interface KanbanSectionProps {
  section: TSection;
  onCreateTask: (sectionId: number) => void;
  isCreatingTask: boolean;
  children: ReactNode;
}

export function KanbanSection({
  section,
  onCreateTask,
  isCreatingTask,
  children,
}: KanbanSectionProps) {
  return (
    <Section className="flex h-full w-96 flex-shrink-0 flex-col bg-gray-50">
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
            onClick={() => onCreateTask(section.id)}
            disabled={isCreatingTask}
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
        {children}
      </SectionContent>
      <SectionFooter>
        <Button
          variant="ghost"
          className="w-full border-none px-0 text-black"
          onClick={() => onCreateTask(section.id)}
          disabled={isCreatingTask}
        >
          <PlusIcon />
          태스크 추가
        </Button>
      </SectionFooter>
    </Section>
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
