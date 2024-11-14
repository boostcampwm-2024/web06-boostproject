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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import Tag from '@/components/Tag';
import { useAuth } from '@/contexts/authContext.tsx';
import { cn } from '@/lib/utils';

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

interface Task {
  id: number;
  title: string;
  description: string;
  sectionName: string;
  position: string;
}

interface Section {
  id: number;
  name: string;
  tasks: Task[];
}

enum TaskStatus {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

type TaskWithStatus = Task & { status?: TaskStatus };

function TaskCard({ task }: { task: TaskWithStatus }) {
  const [showEffect, setShowEffect] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEffect(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const getBorderColor = () => {
    if (!showEffect) return '';
    switch (task.status) {
      case TaskStatus.CREATED:
        return 'border-2 border-green-500';
      case TaskStatus.UPDATED:
        return 'border-2 border-primary';
      case TaskStatus.DELETED:
        return 'border-2 border-red-500';
      default:
        return '';
    }
  };

  return (
    <Card className={cn('bg-[#ffffff] transition-all duration-300', getBorderColor())}>
      <CardHeader className="flex flex-row items-start gap-2">
        <CardTitle className="text-md mt-1.5 flex flex-1 break-keep">{task.title}</CardTitle>
        <div className="mt-0 inline-flex h-8 w-8 rounded-full bg-amber-200" />
      </CardHeader>
      <CardContent className="flex gap-1">
        <Tag text="Feature" />
        <Tag text="FE" className="bg-pink-400" />
      </CardContent>
      <CardFooter className="flex justify-start">
        <p className="text-gray-500">+ 서브 태스크 추가</p>
      </CardFooter>
    </Card>
  );
}

function Kanban() {
  const { project: projectId } = useParams({
    from: '/_auth/$project/board',
  });

  const auth = useAuth();
  const [sections, setSections] = useState<Section[]>(initialSections);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // const response = await axios.get(`/api/tasks?projectId=${projectId}`, {
        //   headers: {
        //     Authorization: `Bearer ${auth.accessToken}`,
        //   },
        // });
        //
        // const sections = response.data.result;

        setSections(initialSections);
      } catch (error) {
        alert('Failed to fetch tasks');
      }
    };

    fetchTasks();
  }, [projectId, auth.accessToken]);

  useEffect(() => {
    let isMounted = true;
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

        if (isMounted) {
          await startPolling();
        }
      } catch (error) {
        alert(`실시간 업데이트가 종료되었습니다. ${error}`);
      }
    };

    startPolling();

    return () => {
      isMounted = false;
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
                  section.tasks.map((task) => (
                    <TaskCard key={task.id} task={task as TaskWithStatus} />
                  ))}
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
