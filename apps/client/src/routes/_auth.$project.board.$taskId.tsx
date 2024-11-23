import { useCallback, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { Textarea } from '@/components/ui/textarea.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Input } from '@/components/ui/input.tsx';

export const Route = createFileRoute('/_auth/$project/board/$taskId')({
  component: TaskDetailComponent,
});

function TaskDetailComponent() {
  const navigate = useNavigate({ from: '/$project/board/$taskId' });
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(async () => {
    setIsClosing(true);

    setTimeout(() => {
      navigate({ to: '/$project/board' });
    }, 300);
  }, [navigate]);

  // data
  const [isEditDescription, setIsEditDescription] = useState(false);
  const [description, setDescription] = useState('');
  const prevDescriptionRef = useRef(description);

  const handleDoubleClick = () => {
    setIsEditDescription(true);
  };

  const handleSave = () => {
    prevDescriptionRef.current = description;
    setIsEditDescription(false);
  };

  const handleCancel = () => {
    setIsEditDescription(false);
    setDescription(prevDescriptionRef.current);
  };

  // Subtasks 상태 관리 추가
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);

  const handleAddSubtask = () => {
    const newId = Math.max(...subtasks.map((task) => task.id), 0) + 1;
    const newSubtask = {
      id: newId,
      content: '새 서브 태스크',
      completed: false,
      isNew: true, // 새로 추가된 항목 표시
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
      // 내용이 비어있으면 삭제
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
                  <h2 className="text-3xl font-semibold">디테일 페이지</h2>
                  <Button variant="ghost" size="icon" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="mt-4 grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6 border-r border-gray-300 pr-4">
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Description</h3>
                    {isEditDescription ? (
                      <div className="space-y-2">
                        <Textarea
                          value={description}
                          placeholder="설명을 작성해주세요."
                          onChange={(e) => setDescription(e.target.value)}
                          className="min-h-[100px]"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button onClick={handleCancel} variant="outline" size="sm">
                            취소
                          </Button>{' '}
                          <Button onClick={handleSave} size="sm">
                            저장
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className="text-muted-foreground cursor-pointer rounded p-2 hover:bg-gray-50"
                        onDoubleClick={handleDoubleClick}
                      >
                        {description.length === 0 ? '설명을 작성해주세요.' : description}
                      </p>
                    )}
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-medium">Subtasks</h3>

                    <div className="space-y-2">
                      {subtasks.map((subtask) => (
                        <Subtask
                          key={subtask.id}
                          subtask={subtask}
                          onToggle={handleToggleSubtask}
                          onUpdate={handleUpdateSubtask}
                          onDelete={handleDeleteSubtask}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddSubtask}
                      className="mt-2 w-full text-xs"
                    >
                      + Add subtask
                    </Button>
                  </div>
                </div>

                <div className="space-y-5 pb-4">
                  <div>
                    <h3 className="text-muted-foreground mb-2 text-sm font-medium">Assignee</h3>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="https://avatars.githubusercontent.com/u/101315505?v=4" />
                        <AvatarFallback>PMtHk</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">Jooyeob</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="rounded-full bg-gray-300" />

                  <div>
                    <h3 className="text-muted-foreground mb-2 text-sm font-medium">Labels</h3>
                    <div className="flex flex-wrap gap-1">
                      <Badge className="bg-[#6188ff] hover:bg-[#6188ff]">Feature</Badge>
                      <Badge className="bg-[#F472b6] hover:bg-[#F472b6]">FE</Badge>
                    </div>
                  </div>

                  <Separator className="rounded-full bg-gray-300" />

                  <div>
                    <h3 className="text-muted-foreground mb-2 text-sm font-medium">Priority</h3>
                    <Badge variant="outline" className="">
                      <Star size={16} />
                      <Star size={16} />
                      <Star size={16} />
                      <Star size={16} />
                      <Star size={16} />
                    </Badge>
                  </div>

                  <Separator className="rounded-full bg-gray-300" />

                  <div>
                    <h3 className="text-muted-foreground mb-2 text-sm font-medium">Sprint</h3>
                    <p className="text-sm">Week 4</p>
                    <div>
                      <p className="text-muted-foreground text-xs">2024-11-25</p>
                      <p className="text-muted-foreground text-xs">2024-11-25</p>
                    </div>
                  </div>

                  <Separator className="rounded-full bg-gray-300" />

                  <div>
                    <h3 className="text-muted-foreground mb-2 text-sm font-medium">Estimate</h3>
                    <p className="text-sm">3 points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

type Subtask = {
  id: number;
  content: string;
  completed: boolean;
};

interface SubtaskProps {
  subtask: {
    id: number;
    content: string;
    completed: boolean;
  };
  onToggle: (id: number) => void;
  onUpdate: (id: number, content: string) => void;
  onDelete: (id: number) => void;
}

function Subtask({ subtask, onToggle, onUpdate, onDelete }: SubtaskProps) {
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
            <Button onClick={handleCancel} size="sm" variant="ghost">
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
          <Button variant="ghost" size="sm" onClick={() => onDelete(subtask.id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
