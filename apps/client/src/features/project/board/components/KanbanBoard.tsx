import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/lib/useToast.tsx';
import { useBoardMutations } from '@/features/project/board/useBoardMutations.ts';
import { calculatePosition, findDiff, findTask } from '@/features/project/board/utils.ts';
import { useBoardStore } from '@/features/project/board/useBoardStore.ts';
import { useDragAndDrop } from '@/features/project/board/useDragAndDrop.ts';
import { BoardSection } from '@/features/project/board/components/KanbanSection.tsx';
import { TaskCard } from '@/features/project/board/components/KanbanTask.tsx';

interface KanbanBoardProps {
  projectId: number;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { sections, updateTaskPosition, updateTaskTitle, restoreState } = useBoardStore();

  const toast = useToast();

  const {
    updateTitle: { mutate: updateTitleMutate },
    updatePosition: { mutate: updatePositionMutate },
  } = useBoardMutations(projectId);

  const onDrop = (sectionId: number, taskId: number) => {
    const targetSection = sections.find((section) => section.id === sectionId);
    if (!targetSection) return;

    const position =
      belowTaskId === -1
        ? calculatePosition(targetSection.tasks, -1)
        : calculatePosition(targetSection.tasks, belowTaskId);

    const previousSections = [...sections];

    updateTaskPosition(sectionId, taskId, position);

    updatePositionMutate(
      {
        event: 'UPDATE_POSITION',
        sectionId,
        taskId,
        position,
      },
      {
        onError: () => {
          restoreState(previousSections);
          toast.error('Failed to update task position');
        },
      }
    );
  };

  const {
    belowSectionId,
    belowTaskId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useDragAndDrop(onDrop);

  const handleTitleChange = (taskId: number, newTitle: string) => {
    updateTaskTitle(taskId, newTitle);

    const task = findTask(sections, taskId);
    if (!task) return;

    const diff = findDiff(task.title, newTitle);

    const deletePayload = {
      event: 'DELETE_TITLE' as const,
      taskId,
      title: {
        position: diff.position,
        content: diff.originalContent,
        length: diff.originalContent.length,
      },
    };

    const insertPayload = {
      event: 'INSERT_TITLE' as const,
      taskId,
      title: {
        position: diff.position,
        content: diff.content,
        length: diff.content.length,
      },
    };

    if (diff.originalContent.length > 0) {
      updateTitleMutate(deletePayload, {
        onSuccess: () => {
          if (diff.content.length > 0) {
            updateTitleMutate(insertPayload);
          }
        },
      });
    } else if (diff.content.length > 0) {
      updateTitleMutate(insertPayload);
    }
  };

  return (
    <div className="spazce-x-2 flex h-[calc(100vh-110px)] gap-2 overflow-x-auto p-4">
      <AnimatePresence mode="popLayout">
        {sections.map((section) => (
          <BoardSection
            key={section.id}
            section={section}
            isBelow={section.id === belowSectionId}
            onDrop={(e) => handleDrop(e, section.id)}
            onDragOver={(e) => handleDragOver(e, section.id)}
          >
            {section.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isBelow={task.id === belowTaskId}
                onDragStart={(e) => handleDragStart(e, section.id, task.id)}
                onDragOver={(e) => handleDragOver(e, section.id, task.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, section.id)}
                onTitleChange={handleTitleChange}
              />
            ))}
          </BoardSection>
        ))}
      </AnimatePresence>
    </div>
  );
}
