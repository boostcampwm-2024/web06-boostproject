import { Dispatch, SetStateAction, useState } from 'react';
import { Search, Settings, Tag, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/details/types.tsx';
import { cn } from '@/lib/utils.ts';

interface LabelsProps {
  labels: Label[];
  selectedLabels: number[];
  setSelectedLabels: Dispatch<SetStateAction<number[]>>;
}

export default function Labels({ labels, selectedLabels, setSelectedLabels }: LabelsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLabel = (label: Label) => {
    setSelectedLabels((prev) =>
      prev.includes(label.id) ? prev.filter((id) => id !== label.id) : [...prev, label.id]
    );
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-muted-foreground flex items-center text-sm font-medium">
          <Tag className="mr-2 h-4 w-4" />
          <span>라벨</span>
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
            <div className="border-b border-gray-200 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  className="pl-10"
                  placeholder="라벨 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredLabels.map((label) => (
                <button
                  type="button"
                  key={label.id}
                  onClick={() => toggleLabel(label)}
                  className={cn(
                    'flex cursor-pointer items-center gap-1 px-4 py-2 text-sm',
                    selectedLabels.includes(label.id) && 'bg-blue-100'
                  )}
                >
                  <Badge style={{ backgroundColor: label.color }}>{label.name}</Badge>
                  <div className="flex-1" />
                  {selectedLabels.includes(label.id) && <X className="h-4 w-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-1">
        {selectedLabels.length > 0 &&
          selectedLabels.map((id) => {
            const label = labels.find((l) => l.id === id);
            if (!label) return null;
            return (
              <Badge key={id} style={{ backgroundColor: label.color }}>
                {label.name}
              </Badge>
            );
          })}

        {selectedLabels.length === 0 && <p className="text-xs text-gray-600">라벨이 없습니다.</p>}
      </div>
    </div>
  );
}
