import { ReactNode } from 'react';
import { HamburgerMenuIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import {
  Section,
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle,
} from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { TSection, TTask } from '@/types';
import TaskCard from '@/components/TaskCard.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';

interface KanbanProps {
  sections: TSection[];
}

export default function Kanban({ sections }: KanbanProps) {
  return (
    <SectionWrapper>
      {sections.map((section: TSection) => (
        <Section key={section.id} className="flex h-full w-96 flex-shrink-0 flex-col bg-gray-50">
          <SectionHeader>
            <div className="flex items-center">
              <SectionTitle className="text-xl">{section.name}</SectionTitle>
              <SectionCounter>{section.tasks.length || 0}</SectionCounter>
            </div>
            <SectionMenu />
          </SectionHeader>
          <SectionContent className="flex flex-1 flex-col gap-2 overflow-y-auto">
            {section.tasks.map((task: TTask) => TaskCard({ task }))}
          </SectionContent>
          <SectionFooter className="font-medium text-gray-600">+ 태스크 추가</SectionFooter>
        </Section>
      ))}
      <Button type="button" variant="outline" className="h-full w-36" disabled>
        + 섹션 추가
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

function SectionMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" className="mt-0 p-0">
          <HamburgerMenuIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="gap-1 bg-white p-0">
        <Button type="button" variant="ghost" className="w-full border-none px-0 text-black">
          <PlusIcon />
          태스크 추가
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="hover:text-destructive w-full border-none bg-white px-0 text-black"
        >
          <TrashIcon />
          섹션 삭제
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
