import { DragEvent, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useMutation, UseQueryResult } from '@tanstack/react-query';
import { PlusIcon } from '@radix-ui/react-icons';
import { LexoRank } from 'lexorank';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import KanbanTask from '@/components/KanbanTask.tsx';
import { useAuth } from '@/contexts/authContext';
import { TSection, TTask } from '@/types';
import { KanbanSection } from '@/components/KanbanSection';

interface KanbanProps {
  sections: TSection[];
  refetch: (options?: { throwOnError: boolean; cancelRefetch: boolean }) => Promise<UseQueryResult>;
}

const calculateLastPosition = (tasks: TTask[]): string => {
  const lastTask = tasks[tasks.length - 1];
  return lastTask
    ? LexoRank.parse(lastTask.position).genNext().toString()
    : LexoRank.middle().toString();
};

export default function Kanban({ sections, refetch }: KanbanProps) {
  const [dialogError, setDialogError] = useState<string | null>(null);
  const { project: projectId } = useParams({ from: '/_auth/$project/board' });
  const { accessToken } = useAuth();

  const createTaskMutation = useMutation({
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
      await refetch();
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
      setDialogError('태스크 생성 중 문제가 발생했습니다. 다시 시도해주세요.');
    },
  });

  const handleCreateTask = (sectionId: number) => {
    const section = sections.find((section) => section.id === sectionId);
    if (!section) return;

    const position = calculateLastPosition(section.tasks);
    createTaskMutation.mutate({ sectionId, position });
  };

  // drag&drop
  const [activeSectionId, setActiveSectionId] = useState(-1);
  const [belowTaskId, setBelowTaskId] = useState(-1);

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

      return axios.post(`/api/project/${projectId}/update`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    },
    onSuccess: async () => {
      setActiveSectionId(-1);
      setBelowTaskId(-1);
      await refetch();
    },
    onError: (error) => {
      console.error('Failed to update task position:', error);
      setDialogError('태스크 이동 중 문제가 발생했습니다. 다시 시도해주세요.');
      setActiveSectionId(-1);
      setActiveSectionId(-1);
    },
  });

  const handleDragOver = (e: DragEvent<HTMLDivElement>, sectionId: number, taskId?: number) => {
    e.preventDefault();
    setActiveSectionId(sectionId);

    if (!taskId) {
      setBelowTaskId(-1);
      return;
    }

    setBelowTaskId(taskId);
  };

  const handleDragLeave = () => {
    setBelowTaskId(-1);
    setActiveSectionId(-1);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, sectionId: number) => {
    const taskId = parseInt(event.dataTransfer.getData('taskId'), 10);

    if (taskId === belowTaskId) {
      setActiveSectionId(-1);
      setBelowTaskId(-1);
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

  const calculatePosition = (tasks: TTask[], belowTaskId: number) => {
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

  const handleDragStart = (event: DragEvent<HTMLDivElement>, sectionId: number, task: TTask) => {
    event.dataTransfer.setData('taskId', task.id.toString());
    event.dataTransfer.setData('sectionId', sectionId.toString());
  };

  return (
    <>
      <div className="flex h-[calc(100vh-110px)] flex-1 flex-row space-x-2 overflow-x-auto p-4">
        {sections.map((section) => (
          <KanbanSection
            key={section.id}
            section={section}
            onCreateTask={handleCreateTask}
            isCreatingTask={createTaskMutation.isPending}
            onDragOver={(e) =>
              handleDragOver(e as unknown as DragEvent<HTMLDivElement>, section.id)
            }
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e as unknown as DragEvent<HTMLDivElement>, section.id)}
            className={
              activeSectionId === section.id
                ? 'border-2 border-blue-500'
                : 'border-2 border-transparent'
            }
          >
            {section.tasks.map((task) => (
              <KanbanTask
                handleDragLeave={handleDragLeave}
                handleDragOver={(e) =>
                  handleDragOver(e as unknown as DragEvent<HTMLDivElement>, section.id, task.id)
                }
                handleDragStart={(e) =>
                  handleDragStart(e as unknown as DragEvent<HTMLDivElement>, section.id, task)
                }
                key={task.id}
                task={task}
              />
            ))}
          </KanbanSection>
        ))}
        <Button type="button" variant="outline" className="h-full w-36" disabled>
          <PlusIcon />
          섹션 추가
        </Button>
      </div>
      <Dialog open={!!dialogError} onOpenChange={() => setDialogError(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>문제가 발생했어요</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-gray-600">{dialogError}</p>
          <DialogFooter>
            <Button variant="default" onClick={() => setDialogError(null)}>
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
