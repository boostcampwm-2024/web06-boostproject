import { useState } from 'react';
import { Search, Settings, Tag, X } from 'lucide-react';
import { useLoaderData } from '@tanstack/react-router';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

import { cn } from '@/lib/utils';
import { useLabelsQuery } from '@/features/project/label/useLabelsQuery';
import { useTaskMutations } from '@/features/task/useTaskMutations';
import { Label } from '@/features/types.ts';
import { useBoardStore } from '@/features/project/board/useBoardStore.ts';

interface LabelsProps {
  initialLabels: Label[];
}

export default function Labels({ initialLabels }: LabelsProps) {
  const { taskId, projectId } = useLoaderData({
    from: '/_auth/$project/board/$taskId',
  });
  const { data: labels = [] } = useLabelsQuery(projectId);
  const { updateLabels } = useTaskMutations(taskId);

  const { updateTaskLabels } = useBoardStore();

  const [selectedLabels, setSelectedLabels] = useState<Label[]>(initialLabels);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLabel = (label: Label) => {
    const isSelected = selectedLabels.some((l) => l.id === label.id);
    const newLabels = isSelected
      ? selectedLabels.filter((l) => l.id !== label.id)
      : [...selectedLabels, label];

    setSelectedLabels(newLabels);
    updateLabels.mutate(
      newLabels.map((l) => l.id),
      {
        onSuccess: () => {
          updateTaskLabels(taskId, newLabels);
        },
      }
    );
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-muted-foreground flex items-center text-sm font-medium">
          <Tag className="mr-2 h-4 w-4" />
          <span>Labels</span>
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
                  placeholder="Type to search..."
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
                    'flex w-full cursor-pointer items-center gap-1 px-4 py-2 text-sm',
                    selectedLabels.some((l) => l.id === label.id) && 'bg-blue-100'
                  )}
                >
                  <Badge style={{ backgroundColor: label.color }}>{label.name}</Badge>
                  {selectedLabels.some((l) => l.id === label.id) && (
                    <X className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
              {filteredLabels.length === 0 && (
                <div className="px-4 py-2 text-sm text-gray-500">검색 결과가 없습니다.</div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-1">
        {selectedLabels.length > 0 ? (
          selectedLabels.map((label) => (
            <Badge key={label.id} style={{ backgroundColor: label.color }}>
              {label.name}
            </Badge>
          ))
        ) : (
          <p className="text-xs text-gray-600">No labels</p>
        )}
      </div>
    </div>
  );
}
