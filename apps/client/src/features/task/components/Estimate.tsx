import { useState } from 'react';
import { Settings, Hash } from 'lucide-react';
import { useLoaderData } from '@tanstack/react-router';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTaskMutations } from '@/features/task/useTaskMutations';

interface EstimateProps {
  initialEstimate: number | null;
}

export default function Estimate({ initialEstimate }: EstimateProps) {
  const { taskId } = useLoaderData({
    from: '/_auth/$project/board/$task',
  });
  const { updateEstimate } = useTaskMutations(taskId);

  const [estimate, setEstimate] = useState<number | null>(initialEstimate);
  const [isOpen, setIsOpen] = useState(false);

  const handleEstimateChange = (value: number) => {
    if (value < 0) return;
    setEstimate(value || null);
    updateEstimate.mutate(value || undefined);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-muted-foreground flex items-center text-sm font-medium">
          <Hash className="mr-2 h-4 w-4" />
          <span>Estimate</span>
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
          <PopoverContent className="bg-surface" align="end">
            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                value={estimate ?? ''}
                onChange={(e) => handleEstimateChange(Number(e.target.value))}
                min={0}
                step={1}
                max={99}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        {estimate !== null ? (
          <p className="text-sm">{estimate} points</p>
        ) : (
          <p className="text-xs text-gray-600">No estimate</p>
        )}
      </div>
    </div>
  );
}
