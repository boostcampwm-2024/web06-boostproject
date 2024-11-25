import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Subtask } from '@/features/task/subtask/types';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (id: number) => void;
  onUpdate: (id: number, content: string) => void;
  onDelete: (id: number) => void;
}

export function SubtaskItem({ subtask, onToggle, onUpdate, onDelete }: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(subtask.content);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    if (!subtask.completed) {
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    onUpdate(subtask.id, editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(subtask.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="group flex items-center space-x-2 rounded p-1 hover:bg-gray-50">
      <Checkbox
        checked={subtask.completed}
        onCheckedChange={() => onToggle(subtask.id)}
        id={`subtask-${subtask.id}`}
        className="border-black data-[state=checked]:bg-black"
      />

      {isEditing ? (
        <div className="flex flex-1 items-center space-x-2">
          <Input
            ref={inputRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1"
          />
          <div className="flex space-x-1">
            <Button onClick={handleSave} size="sm" variant="ghost">
              저장
            </Button>
            <Button onClick={handleCancel} size="sm" variant="ghost" className="hover:text-red-600">
              취소
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-between">
          <p
            onDoubleClick={handleDoubleClick}
            className={`flex-1 cursor-pointer select-none ${
              subtask.completed ? 'text-muted-foreground line-through' : ''
            }`}
          >
            {subtask.content}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(subtask.id)}
            className="hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
