import { DragEvent } from 'react';
import { motion } from 'framer-motion';
import { Link, useLoaderData } from '@tanstack/react-router';
import { PanelLeftOpen } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card.tsx';
import { Task } from '@/features/project/board/types.ts';
import { cn } from '@/lib/utils.ts';
import { TaskTextarea } from '@/features/project/board/components/TaskTextarea.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { AssigneeAvatars } from '@/features/project/board/components/AssigneeAvatars.tsx';
import { SubtaskProgress } from '@/features/project/board/components/SubtaskProgress.tsx';

interface TaskCardProps {
  task: Task;
  isBelow: boolean;
  onDragStart: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent) => void;
  onTitleChange: (id: number, title: string) => void;
}

export function TaskCard({
  task,
  isBelow,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onTitleChange,
}: TaskCardProps) {
  const { projectId } = useLoaderData({
    from: '/_auth/$project/board',
  });

  return (
    <motion.div
      key={task.id}
      layout
      layoutId={task.id.toString()}
      draggable
      initial={{ opacity: 1, zIndex: 1 }}
      animate={{
        zIndex: isBelow ? 50 : 1,
        scale: isBelow ? 1.02 : 1,
      }}
      transition={{
        layout: { duration: 0.2 },
        scale: { duration: 0.2 },
      }}
      style={{ position: 'relative' }}
      onDragStart={(e) => onDragStart(e as unknown as DragEvent)}
      onDrop={(e) => onDrop(e)}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDragOver(e);
      }}
      onDragLeave={onDragLeave}
    >
      <Card
        className={cn(
          'w-56 border bg-white transition-all duration-300 md:w-80',
          isBelow && 'border-2 border-blue-400',
          'hover:shadow-md'
        )}
      >
        <CardHeader className="flex flex-row items-start gap-2 space-y-0">
          <TaskTextarea taskId={task.id} initialTitle={task.title} onTitleChange={onTitleChange} />
          <Button
            variant="ghost"
            type="button"
            asChild
            className="hover:text-primary px-2 hover:bg-transparent"
          >
            <Link to={`/${projectId}/board/${task.id}`} className="p-0">
              <PanelLeftOpen className="h-6 w-6" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="flex items-end justify-between">
          <div className="flex flex-wrap gap-1">
            {task.labels.map((label) => (
              <Badge key={label.id} style={{ backgroundColor: label.color }}>
                {label.name}
              </Badge>
            ))}
          </div>
          <AssigneeAvatars assignees={task.assignees} />
        </CardContent>
        {task.subtasks.total > 0 && (
          <CardFooter className="flex items-center justify-between space-y-0">
            <SubtaskProgress total={task.subtasks.total} completed={task.subtasks.completed} />
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
