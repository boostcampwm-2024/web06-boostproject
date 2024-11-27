import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/shared/utils/useDebounce..ts';

interface TaskTextareaProps {
  taskId: number;
  initialTitle: string;
  onTitleChange: (taskId: number, title: string) => void;
}

export function TaskTextarea({ taskId, initialTitle, onTitleChange }: TaskTextareaProps) {
  const [localTitle, setLocalTitle] = useState(initialTitle);
  const [isComposing, setIsComposing] = useState(false);
  const debouncedTitle = useDebounce(localTitle, 300);
  const prevDebouncedTitle = useRef(debouncedTitle);

  useEffect(() => {
    setLocalTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (!isComposing && debouncedTitle !== prevDebouncedTitle.current) {
      prevDebouncedTitle.current = debouncedTitle;
      onTitleChange(taskId, debouncedTitle);
    }
  }, [debouncedTitle, isComposing, taskId, onTitleChange]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setLocalTitle(e.target.value);
  };

  const handleCompositionStart = () => setIsComposing(true);

  const handleCompositionEnd = () => setIsComposing(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.code === 'Space' && isComposing) {
      setIsComposing(false);
    }
  };

  return (
    <textarea
      value={localTitle}
      onChange={handleChange}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onKeyDown={handleKeyDown}
      className="flex flex-1 resize-none bg-transparent focus:outline-none"
      placeholder="Enter task title..."
    />
  );
}
