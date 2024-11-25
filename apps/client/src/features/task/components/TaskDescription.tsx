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
    from: '/_auth/$project/board/$taskId',
  });
  const [isEdit, setIsEdit] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const prevDescriptionRef = useRef(description);

  const { updateDescription } = useTaskMutations(taskId);

  const handleDoubleClick = () => setIsEdit(true);

  const handleSave = () => {
    updateDescription.mutate(description);
  };

  const handleCancel = () => {
    setIsEdit(false);
    setDescription(prevDescriptionRef.current);
  };

  return (
    <div>
      <h3 className="mb-2 text-lg font-medium">Description</h3>
      {isEdit ? (
        <div className="space-y-2">
          <Textarea
            value={description}
            placeholder="Description should be here..."
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
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
        <p
          className="cursor-pointer rounded p-2 text-gray-700 hover:bg-gray-50"
          onDoubleClick={handleDoubleClick}
        >
          {description.length === 0 ? 'Double click to edit' : description}
        </p>
      )}
    </div>
  );
}
