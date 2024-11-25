import { useEffect, useRef, useState } from 'react';
import { useLoaderData } from '@tanstack/react-router';
import { Subtask } from '@/features/task/subtask/types';
import { SubtaskItem } from '@/features/task/subtask/components/SubtaskItem';
import { useSubtaskMutations } from '@/features/task/subtask/useSubtaskMutations';
import { Button } from '@/components/ui/button';

interface SubtasksProps {
  initialSubtasks?: Subtask[];
}

export function Subtasks({ initialSubtasks = [] }: SubtasksProps) {
  const { taskId } = useLoaderData({
    from: '/_auth/$project/board/$taskId',
  });
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);
  const subtasksRef = useRef<HTMLDivElement>(null);

  const { create, update, delete: deleteSubtask } = useSubtaskMutations(taskId);

  const createMutation = create({
    onSuccess: (newSubtask: Subtask) => {
      setSubtasks((prev) => [...prev, newSubtask]);
    },
  });

  const updateMutation = update({
    onSuccess: (updatedSubtask) => {
      setSubtasks((prev) =>
        prev.map((subtask) => (subtask.id === updatedSubtask.id ? updatedSubtask : subtask))
      );
    },
  });

  const deleteMutation = deleteSubtask({
    onSuccess: (deletedSubtask: Subtask) => {
      setSubtasks((prev) => prev.filter((subtask) => subtask.id !== deletedSubtask.id));
    },
  });

  const handleAddSubtask = () => {
    createMutation.mutate();
  };

  const handleToggleSubtask = (id: number) => {
    const subtask = subtasks.find((subtask) => subtask.id === id);

    if (!subtask) {
      return;
    }

    updateMutation.mutate({
      subtaskId: id,
      updateSubtaskDto: { completed: !subtask.completed },
    });
  };

  const handleUpdateSubtask = (id: number, newContent: string) => {
    if (!newContent.trim()) {
      deleteMutation.mutate(id);
      return;
    }

    updateMutation.mutate({
      subtaskId: id,
      updateSubtaskDto: { content: newContent },
    });
  };

  const handleDeleteSubtask = (id: number) => {
    deleteMutation.mutate(id);
  };

  useEffect(() => {
    if (subtasksRef.current) {
      subtasksRef.current.scrollTop = subtasksRef.current.scrollHeight;
    }
  }, [subtasks.length]);

  return (
    <div>
      <h3 className="mb-2 text-lg font-medium">Subtasks</h3>
      <div className="max-h-96 space-y-0.5 overflow-y-auto" ref={subtasksRef}>
        {subtasks.map((subtask) => (
          <SubtaskItem
            key={subtask.id}
            subtask={subtask}
            onToggle={handleToggleSubtask}
            onUpdate={handleUpdateSubtask}
            onDelete={handleDeleteSubtask}
          />
        ))}
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleAddSubtask}
        className="mt-2 w-full text-xs"
      >
        + Add New Subtask
      </Button>
    </div>
  );
}
