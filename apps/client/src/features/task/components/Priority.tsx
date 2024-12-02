import { useState } from 'react';
import { Settings, Star, X } from 'lucide-react';
import { useLoaderData } from '@tanstack/react-router';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTaskMutations } from '@/features/task/useTaskMutations';

const priorityLevels = [
  { level: 5, label: 'P5' },
  { level: 4, label: 'P4' },
  { level: 3, label: 'P3' },
  { level: 2, label: 'P2' },
  { level: 1, label: 'P1' },
];

interface PriorityProps {
  initialPriority: number | null;
}

function PriorityStars({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {priorityLevels.slice(5 - count).map(({ label }) => (
        <Star key={label} size={16} className="fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

export default function Priority({ initialPriority }: PriorityProps) {
  const { taskId } = useLoaderData({
    from: '/_auth/$project/board/$task',
  });
  const { updatePriority } = useTaskMutations(taskId);

  const [priority, setPriority] = useState<number | null>(initialPriority);
  const [isOpen, setIsOpen] = useState(false);

  const togglePriority = (level: number) => {
    if (priority === level) {
      setPriority(null);
      updatePriority.mutate(undefined);
      return;
    }

    setPriority(level);
    updatePriority.mutate(level);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-muted-foreground flex items-center text-sm font-medium">
          <Star className="mr-2 h-4 w-4" />
          <span>Priority</span>
        </h3>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-6 w-6"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-surface p-0" align="end">
            <div className="max-h-60 overflow-y-auto py-1">
              {priorityLevels.map(({ level }) => (
                <button
                  type="button"
                  key={level}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between px-4 py-2 hover:bg-blue-100',
                    priority === level && 'bg-blue-100'
                  )}
                  onClick={() => togglePriority(level)}
                >
                  <PriorityStars count={level} />
                  {priority === level && <X className="h-4 w-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        {priority ? (
          <Badge variant="outline" className="gap-1">
            <PriorityStars count={priority} />
          </Badge>
        ) : (
          <p className="text-xs text-gray-600">No priority</p>
        )}
      </div>
    </div>
  );
}
