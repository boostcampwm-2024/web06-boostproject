import { useCallback, useEffect, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Input } from '@/components/ui/input.tsx';
import DetailSidebar from '@/details/SidebarInfo.tsx';

// Types
interface Subtask {
  id: number;
  content: string;
  completed: boolean;
}

interface SubtaskProps {
  subtask: Subtask;
  onToggle: (id: number) => void;
  onUpdate: (id: number, content: string) => void;
  onDelete: (id: number) => void;
}

// Subtask Component
function SubtaskComponent({ subtask, onToggle, onUpdate, onDelete }: SubtaskProps) {
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

// Description Section Component
function DescriptionSection({
  description,
  isEditDescription,
  setDescription,
  setIsEditDescription,
  handleSave,
  handleCancel,
}: {
  description: string;
  isEditDescription: boolean;
  setDescription: (value: string) => void;
  setIsEditDescription: (value: boolean) => void;
  handleSave: () => void;
  handleCancel: () => void;
}) {
  const handleDoubleClick = () => setIsEditDescription(true);

  return (
    <div>
      <h3 className="mb-2 text-lg font-medium">Description</h3>
      {isEditDescription ? (
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

// Main Component
export const Route = createFileRoute('/_auth/$project/board/$taskId')({
  component: TaskDetailComponent,
});

function TaskDetailComponent() {
  const navigate = useNavigate({ from: '/$project/board/$taskId' });
  const [isClosing, setIsClosing] = useState(false);
  const [isEditDescription, setIsEditDescription] = useState(false);
  const [description, setDescription] = useState('');
  const prevDescriptionRef = useRef(description);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = useCallback(async () => {
    setIsClosing(true);
    setTimeout(() => {
      navigate({ to: '/$project/board' });
    }, 300);
  }, [navigate]);

  const handleSave = () => {
    prevDescriptionRef.current = description;
    setIsEditDescription(false);
  };

  const handleCancel = () => {
    setIsEditDescription(false);
    setDescription(prevDescriptionRef.current);
  };

  const handleAddSubtask = () => {
    const newId = Math.max(...subtasks.map((task) => task.id), 0) + 1;
    const newSubtask = {
      id: newId,
      content: 'New Subtask',
      completed: false,
      isNew: true,
    };
    setSubtasks((prev) => [...prev, newSubtask]);
  };

  const handleToggleSubtask = (id: number) => {
    setSubtasks((prevSubtasks) =>
      prevSubtasks.map((subtask) =>
        subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
      )
    );
  };

  const handleUpdateSubtask = (id: number, newContent: string) => {
    if (newContent.trim() === '') {
      handleDeleteSubtask(id);
      return;
    }
    setSubtasks((prevSubtasks) =>
      prevSubtasks.map((subtask) =>
        subtask.id === id ? { ...subtask, content: newContent, isNew: false } : subtask
      )
    );
  };

  const handleDeleteSubtask = (id: number) => {
    setSubtasks((prevSubtasks) => prevSubtasks.filter((subtask) => subtask.id !== id));
  };

  const subtasksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subtasksRef.current) {
      subtasksRef.current.scrollTop = subtasksRef.current.scrollHeight;
    }
  }, [subtasks.length]); // subtasks 길이가 변경될 때만 실행

  return (
    <AnimatePresence mode="wait" onExitComplete={() => setIsClosing(false)}>
      {!isClosing && (
        <>
          <motion.div
            key="overlay"
            className="fixed inset-0 z-30 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            key="panel"
            className="bg-surface fixed inset-y-0 right-0 z-50 w-full border-l md:w-2/3"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
            }}
          >
            <Card className="h-full rounded-none border-none">
              <CardHeader className="bg-blue sticky top-0 z-40 h-[100px] backdrop-blur">
                <div className="flex h-full items-center justify-between">
                  <h2 className="text-3xl font-semibold">Make Project Bigger</h2>
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="mt-4 grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6 pr-4">
                  <DescriptionSection
                    description={description}
                    isEditDescription={isEditDescription}
                    setDescription={setDescription}
                    setIsEditDescription={setIsEditDescription}
                    handleSave={handleSave}
                    handleCancel={handleCancel}
                  />

                  <div>
                    <h3 className="mb-2 text-lg font-medium">Subtasks</h3>
                    <div className="max-h-96 space-y-0.5 overflow-y-auto" ref={subtasksRef}>
                      {subtasks.map((subtask) => (
                        <SubtaskComponent
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
                </div>

                <DetailSidebar />
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
