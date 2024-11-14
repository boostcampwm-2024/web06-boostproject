import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from '@tanstack/react-router';
import {
  Section,
  SectionContent,
  SectionFooter,
  SectionHeader,
  SectionTitle,
} from '@/components/ui/section.tsx';
import { useAuth } from '@/contexts/authContext.tsx';
import TaskCard from '@/components/TaskCard.tsx';
import type { Task } from '@/components/TaskCard.tsx';

const initialSections = [
  {
    id: 99997,
    name: 'To Do',
    tasks: [],
  },
  {
    id: 99998,
    name: 'In Progress',
    tasks: [],
  },
  {
    id: 99999,
    name: 'Done',
    tasks: [],
  },
];

type Section = {
  id: number;
  name: string;
  tasks: Task[];
};

function Kanban() {
  const { project: projectId } = useParams({
    from: '/_auth/$project/board',
  });

  const auth = useAuth();
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    // 1차 조회
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`/api/tasks?projectId=${projectId}`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });

        const sections = response.data.result;

        setSections(sections);
      } catch (error) {
        alert(`태스크를 불러오는 중 오류가 발생했습니다. ${error}`);
        setSections(initialSections);
      }
    };

    fetchTasks();
  }, [projectId, auth.accessToken]);

  useEffect(() => {
    // 롱폴링
    const startPolling = async () => {
      try {
        const response = await axios.post(`/api/snapshot/${projectId}`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });

        if (response.status === 200) {
          const {
            data: { project: newSections },
          } = response;
          setSections(newSections);
        }

        if (isPolling) {
          await startPolling();
        }
      } catch (error) {
        setIsPolling(false);
        alert(`실시간 업데이트가 종료되었습니다. ${error}`);
      }
    };

    startPolling();

    return () => {
      setIsPolling(false);
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-110px)] flex-col">
      <div className="flex flex-1 space-x-2 overflow-x-auto p-4">
        {sections.map((section) => (
          <Section
            key={section.name}
            className="flex h-fit max-h-[calc(100vh-142px)] w-96 flex-shrink-0 flex-col bg-gray-50"
          >
            <SectionHeader>
              <SectionTitle className="text-xl">{section.name}</SectionTitle>
            </SectionHeader>
            <SectionContent className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {section.tasks.length > 0 &&
                  section.tasks.map((task) => <TaskCard key={task.id} task={task} />)}
              </div>
            </SectionContent>
            <SectionFooter className="font-medium text-gray-600">+ 태스크 추가</SectionFooter>
          </Section>
        ))}
      </div>
    </div>
  );
}

export default Kanban;
