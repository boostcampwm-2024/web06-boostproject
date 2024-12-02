import { useRef, useState } from 'react';
import { useLoaderData } from '@tanstack/react-router';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useTaskMutations } from '@/features/task/useTaskMutations.ts';

interface TaskDescriptionProps {
  initialDescription?: string;
}

export function TaskDescription({ initialDescription = '' }: TaskDescriptionProps) {
  const { taskId } = useLoaderData({
    from: '/_auth/$project/board/$task',
  });
  const [isEdit, setIsEdit] = useState(false);
  const [description, setDescription] = useState<string>(initialDescription);
  const prevDescriptionRef = useRef(description);

  const { updateDescription } = useTaskMutations(taskId);

  const handleDoubleClick = () => setIsEdit(true);

  const handleSave = () => {
    updateDescription.mutate(description);
    prevDescriptionRef.current = description;
    setIsEdit(false);
  };

  const handleCancel = () => {
    setIsEdit(false);
    setDescription(prevDescriptionRef.current);
  };

  return (
    <div className="max-h-[calc(50vh-58px)]">
      <h3 className="text-lg font-medium">Description</h3>
      {isEdit ? (
        <div className="max-h-[calc(50vh-86px)] space-y-2">
          <Textarea
            value={description}
            placeholder="Description should be here..."
            onChange={(e) => setDescription(e.target.value)}
            className="max-h-[calc(50vh-126px)] min-h-32 w-full overflow-y-auto"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel} variant="outline" size="sm">
              취소
            </Button>
            <Button onClick={handleSave} size="sm">
              저장
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="max-h-[calc(50vh-86px)] max-w-full cursor-pointer overflow-y-auto whitespace-pre-wrap break-words rounded p-2 text-gray-700 hover:bg-gray-50"
          onDoubleClick={handleDoubleClick}
        >
          {description.length === 0 ? 'Double click to edit' : description}
        </div>
      )}
    </div>
  );
}
