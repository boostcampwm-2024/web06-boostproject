import { Dispatch, ReactNode, SetStateAction } from 'react';
import { useParams } from '@tanstack/react-router';
import { HamburgerMenuIcon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { LexoRank } from 'lexorank';
import axios from 'axios';
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
import { useAuth } from '@/contexts/authContext.tsx';

interface KanbanProps {
  sections: TSection[];
  setSections: Dispatch<SetStateAction<TSection[]>>;
}

export default function Kanban({ sections, setSections }: KanbanProps) {
  const { project: projectId } = useParams({ from: '/_auth/$project/board' });
  const auth = useAuth();

  const handleCreateTask = async (sectionId: number) => {
    const section = sections.find((section) => section.id === sectionId);
    const lastTask = section?.tasks[section.tasks.length - 1];
    const afterLastTaskPosition = lastTask
      ? LexoRank.parse(lastTask.position).genNext()
      : LexoRank.middle();

    const prevSections = [...sections];

    try {
      setSections((sections) =>
        sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              tasks: [
                ...section.tasks,
                {
                  id: -1, // 임시 ID 부여
                  title: '',
                  description: '',
                  position: afterLastTaskPosition.toString(),
                },
              ],
            };
          }
          return section;
        })
      );

      const response = await axios.post(
        `/api/project/${projectId}/update`,
        {
          event: 'CREATE_TASK',
          sectionId,
          position: afterLastTaskPosition.toString(),
        },
        {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        }
      );

      if (response.status === 200) {
        const { id } = response.data.result;
        setSections((sections) =>
          sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  tasks: section.tasks.map((task) => (task.id === -1 ? { ...task, id } : task)),
                }
              : section
          )
        );
      }
    } catch {
      setSections(prevSections);
    }
  };
  return (
    <SectionWrapper>
      {sections.map((section: TSection) => (
        <Section key={section.id} className="flex h-full w-96 flex-shrink-0 flex-col bg-gray-50">
          <SectionHeader>
            <div className="flex items-center">
              <SectionTitle className="text-xl">{section.name}</SectionTitle>
              <SectionCounter>{section.tasks.length || 0}</SectionCounter>
            </div>
            <SectionMenu>
              <Button
                type="button"
                variant="ghost"
                className="w-full border-none px-0 text-black"
                onClick={() => handleCreateTask(section.id)}
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
            {section.tasks.map((task: TTask) => TaskCard({ task }))}
          </SectionContent>
          <SectionFooter>
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
