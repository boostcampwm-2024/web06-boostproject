import {
  ChangeEvent,
  DragEvent,
  useState,
  useCallback,
  useRef,
  CompositionEvent,
  memo,
  useEffect,
} from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import Tag from '@/components/Tag.tsx';
import { TTask } from '@/types';
import { useAuth } from '@/contexts/authContext.tsx';

interface TaskProps {
  task: TTask;
  handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
  handleDragLeave: () => void;
  handleDragStart: (e: DragEvent<HTMLDivElement>) => void;
  belowed: boolean;
  refetch: () => void;
}

interface UpdatePayload {
  event: 'INSERT_TITLE' | 'DELETE_TITLE';
  diff: string;
  position: number;
}

function calculateDiff(oldValue: string, newValue: string) {
  let start = 0;

  while (
    start < oldValue.length &&
    start < newValue.length &&
    oldValue[start] === newValue[start]
  ) {
    start += 1;
  }

  let oldEnd = oldValue.length - 1;
  let newEnd = newValue.length - 1;

  while (oldEnd >= start && newEnd >= start && oldValue[oldEnd] === newValue[newEnd]) {
    oldEnd -= 1;
    newEnd -= 1;
  }

  const deletedLength = oldEnd - start + 1;
  const deleted = oldValue.slice(start, oldEnd + 1);
  const inserted = newValue.slice(start, newEnd + 1);

  return {
    start,
    deletedLength,
    deleted,
    inserted,
  };
}

const KanbanTask = memo(function KanbanTask({
  task,
  handleDragOver,
  handleDragLeave,
  handleDragStart,
  belowed,
  refetch,
}: TaskProps) {
  const { project: projectId } = useParams({ from: '/_auth/$project/board' });
  const { accessToken } = useAuth();
  const [title, setTitle] = useState<string>(task.title);
  const [composing, setComposing] = useState(false);
  const prevTitleRef = useRef<string>(title);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<UpdatePayload[]>([]);

  const updateTitleMutation = useMutation({
    mutationFn: async (updates: UpdatePayload[]) => {
      const promises = updates.map(({ event, diff, position }) => {
        const payload = {
          event,
          taskId: task.id,
          title: {
            content: diff,
            position,
            length: diff.length,
          },
        };

        return axios.post(`/api/project/${projectId}/update`, payload, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      });

      return Promise.all(promises);
    },
    onSuccess: async () => {
      await refetch();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const flushUpdates = useCallback(() => {
    if (pendingUpdatesRef.current.length > 0) {
      updateTitleMutation.mutate(pendingUpdatesRef.current);
      pendingUpdatesRef.current = [];
    }
  }, [updateTitleMutation]);

  const queueUpdate = useCallback(
    (update: UpdatePayload) => {
      pendingUpdatesRef.current.push(update);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        flushUpdates();
        timeoutRef.current = null;
      }, 500);
    },
    [flushUpdates]
  );

  const onDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      handleDragOver(e);
    },
    [handleDragOver]
  );

  const handleTitleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();
      const newValue = e.target.value;
      setTitle(newValue);

      if (!composing) {
        const { start, deletedLength, deleted, inserted } = calculateDiff(
          prevTitleRef.current,
          newValue
        );
        prevTitleRef.current = newValue;

        if (deletedLength > 0) {
          queueUpdate({
            event: 'DELETE_TITLE',
            diff: deleted,
            position: start,
          });
        }

        if (inserted.length > 0) {
          queueUpdate({
            event: 'INSERT_TITLE',
            diff: inserted,
            position: start,
          });
        }
      }
    },
    [composing, queueUpdate]
  );

  const handleCompositionStart = useCallback(() => {
    setComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(
    (e: CompositionEvent<HTMLInputElement>) => {
      setComposing(false);
      const newValue = e.currentTarget.value;

      const { start, deletedLength, deleted, inserted } = calculateDiff(
        prevTitleRef.current,
        newValue
      );
      prevTitleRef.current = newValue;

      if (deletedLength > 0) {
        queueUpdate({
          event: 'DELETE_TITLE',
          diff: deleted,
          position: start,
        });
      }

      if (inserted.length > 0) {
        queueUpdate({
          event: 'INSERT_TITLE',
          diff: inserted,
          position: start,
        });
      }
    },
    [queueUpdate]
  );

  useEffect(() => {
    setTitle(task.title);
    prevTitleRef.current = task.title;
  }, [task.title]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Flush any remaining updates
      flushUpdates();
    };
  }, [flushUpdates]);

  return (
    <motion.div
      layout
      layoutId={task.id.toString()}
      draggable
      onDragStart={(e) => handleDragStart(e as unknown as DragEvent<HTMLDivElement>)}
      onDragOver={onDragOver}
      onDragLeave={handleDragLeave}
    >
      <div
        className={`my-1 h-1 w-full rounded-full bg-blue-500 ${belowed ? 'opacity-100' : 'opacity-0'} transition-all`}
      />
      <Card className="bg-white transition-all duration-300">
        <CardHeader className="flex flex-row items-start gap-2">
          <input
            type="text"
            value={title}
            className="text-md mt-1.5 flex flex-1 break-keep"
            onChange={handleTitleChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
          />
          <div className="mt-0 inline-flex h-8 w-8 rounded-full bg-amber-200" />
        </CardHeader>
        <CardContent className="flex gap-1">
          <Tag text="Feature" />
          <Tag text="FE" className="bg-pink-400" />
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default KanbanTask;
