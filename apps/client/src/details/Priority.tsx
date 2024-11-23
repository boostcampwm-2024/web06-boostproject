import { Dispatch, SetStateAction, useState } from 'react';
import { Settings, Star } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const priorityLevels = [
  { level: 5, label: 'P5' },
  { level: 4, label: 'P4' },
  { level: 3, label: 'P3' },
  { level: 2, label: 'P2' },
  { level: 1, label: 'P1' },
];

interface PriorityProps {
  priority: number | null;
  setPriority: Dispatch<SetStateAction<number | null>>;
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

export default function Priority({ priority, setPriority }: PriorityProps) {
  const [isOpen, setIsOpen] = useState(false);

  const togglePriority = (level: number) => {
    setPriority((prev) => (prev === level ? null : level));
    setIsOpen(false);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-muted-foreground flex items-center text-sm font-medium">
          <Star className="mr-2 h-4 w-4" />
          <span>우선순위</span>
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
                    'hover:bg-accent flex cursor-pointer items-center justify-between px-4 py-2',
                    priority === level && 'bg-accent'
                  )}
                  onClick={() => togglePriority(level)}
                >
                  <PriorityStars count={level} />
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
          <p className="text-xs text-gray-600">우선순위가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
