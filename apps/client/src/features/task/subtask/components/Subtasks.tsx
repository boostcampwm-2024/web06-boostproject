import { useEffect, useRef, useState } from 'react';
import { useLoaderData } from '@tanstack/react-router';
import { Subtask } from '@/features/task/subtask/types';
import { SubtaskItem } from '@/features/task/subtask/components/SubtaskItem';
import { useSubtaskMutations } from '@/features/task/subtask/useSubtaskMutations';
import { Button } from '@/components/ui/button';
import { useBoardStore } from '@/features/project/board/useBoardStore.ts';

interface SubtasksProps {
  initialSubtasks?: Subtask[];
}

export function Subtasks({ initialSubtasks = [] }: SubtasksProps) {
  const { taskId } = useLoaderData({
    from: '/_auth/$project/board/$taskId',
  });

  const { updateTaskSubtasks } = useBoardStore();

  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);
  const subtasksRef = useRef<HTMLDivElement>(null);

  const { create, update, delete: deleteSubtask } = useSubtaskMutations(taskId);

  const handleAddSubtask = () => {
    create.mutate(undefined, {
      onSuccess: (newSubtask: Subtask) => {
        setSubtasks((prev) => {
          const newSubtasks = [...prev, newSubtask];
          updateTaskSubtasks(taskId, {
            total: newSubtasks.length,
            completed: newSubtasks.filter((subtask) => subtask.completed).length,
          });
          return newSubtasks;
        });
      },
    });
  };

  const handleToggleSubtask = (id: number) => {
    const subtask = subtasks.find((subtask) => subtask.id === id);

    if (!subtask) {
      return;
    }

    update.mutate(
      {
        subtaskId: id,
        updateSubtaskDto: { completed: !subtask.completed },
      },
      {
        onSuccess: (updatedSubtask) => {
          setSubtasks((prev) => {
            const newSubtasks = prev.map((subtask) =>
              subtask.id === updatedSubtask.id ? updatedSubtask : subtask
            );
            updateTaskSubtasks(taskId, {
              total: newSubtasks.length,
              completed: newSubtasks.filter((subtask) => subtask.completed).length,
            });
            return newSubtasks;
          });
        },
      }
    );
  };

  const handleUpdateSubtask = (id: number, newContent: string) => {
    if (!newContent.trim()) {
      deleteSubtask.mutate(id, {
        onSuccess: () => {
          setSubtasks((prev) => {
            const newSubtasks = prev.filter((subtask) => subtask.id !== id);
            updateTaskSubtasks(taskId, {
              total: newSubtasks.length,
              completed: newSubtasks.filter((subtask) => subtask.completed).length,
            });
            return newSubtasks;
          });
        },
      });
      return;
    }

    update.mutate(
      {
        subtaskId: id,
        updateSubtaskDto: { content: newContent },
      },
      {
        onSuccess: (updatedSubtask) => {
          setSubtasks((prev) => {
            const newSubtasks = prev.map((subtask) =>
              subtask.id === updatedSubtask.id ? updatedSubtask : subtask
            );
            updateTaskSubtasks(taskId, {
              total: newSubtasks.length,
              completed: newSubtasks.filter((subtask) => subtask.completed).length,
            });
            return newSubtasks;
          });
        },
      }
    );
  };

  const handleDeleteSubtask = (id: number) => {
    deleteSubtask.mutate(id, {
      onSuccess: () => {
        setSubtasks((prev) => {
          const newSubtasks = prev.filter((subtask) => subtask.id !== id);
          updateTaskSubtasks(taskId, {
            total: newSubtasks.length,
            completed: newSubtasks.filter((subtask) => subtask.completed).length,
          });
          return newSubtasks;
        });
      },
    });
  };

  useEffect(() => {
    if (subtasksRef.current) {
      subtasksRef.current.scrollTop = subtasksRef.current.scrollHeight;
    }
  }, [subtasks.length]);

  return (
    <div className="max-h-[calc(50vh-58px)]">
      <h3 className="mb-2 text-lg font-medium">Subtasks</h3>
      <div className="max-h-[calc(50vh-166px)] space-y-0.5 overflow-y-auto" ref={subtasksRef}>
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
