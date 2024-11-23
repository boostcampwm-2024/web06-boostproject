import { Dispatch, SetStateAction, useState } from 'react';
import { Settings, Hash } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EstimateProps {
  estimate: number | null;
  setEstimate: Dispatch<SetStateAction<number | null>>;
}

export default function Estimate({ estimate = 0, setEstimate }: EstimateProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleEstimateChange = (value: number) => {
    setEstimate(value);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-muted-foreground flex items-center text-sm font-medium">
          <Hash className="mr-2 h-4 w-4" />
          <span>예상 시간</span>
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
              <Label>포인트</Label>
              <Input
                type="number"
                value={estimate ?? ''}
                onChange={(e) => handleEstimateChange(Number(e.target.value))}
                min={0}
                step={1}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        {estimate !== null ? (
          <p className="text-sm">{estimate} points</p>
        ) : (
          <p className="text-sm text-gray-600">예상 시간이 없습니다</p>
        )}
      </div>
    </div>
  );
}
