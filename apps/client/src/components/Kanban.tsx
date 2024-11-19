import { useState } from 'react';
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

  return (
    <>
      <div className="flex h-[calc(100vh-110px)] flex-1 flex-row space-x-2 overflow-x-auto p-4">
        {sections.map((section) => (
          <KanbanSection
            key={section.id}
            section={section}
            onCreateTask={handleCreateTask}
            isCreatingTask={createTaskMutation.isPending}
          >
            {section.tasks.map((task) => (
              <KanbanTask key={task.id} task={task} />
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
