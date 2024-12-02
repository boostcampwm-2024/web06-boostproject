import { useState } from 'react';
import { Settings, Calendar, Search, X } from 'lucide-react';
import { useLoaderData } from '@tanstack/react-router';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { cn } from '@/lib/utils.ts';
import { Sprint as TSprint } from '@/features/types.tsx';
import { useTaskMutations } from '@/features/task/useTaskMutations.ts';
import { useSprintsQuery } from '@/features/project/sprint/useSprintsQuery.ts';

interface SprintProps {
  initialSprint: TSprint | null;
}

export default function Sprint({ initialSprint }: SprintProps) {
  const { taskId, projectId } = useLoaderData({
    from: '/_auth/$project/board/$task',
  });
  const { data: sprints = [] } = useSprintsQuery(projectId);
  const { updateSprint } = useTaskMutations(taskId);

  const [selectedSprint, setSelectedSprint] = useState(initialSprint);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSprints = sprints.filter((sprint) =>
    sprint.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSprint = (sprint: TSprint) => {
    if (selectedSprint?.id === sprint.id) {
      setSelectedSprint(null);
      updateSprint.mutate(undefined);
      return;
    }

    setSelectedSprint(sprint);
    updateSprint.mutate(sprint.id);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-muted-foreground flex items-center text-sm font-medium">
          <Calendar className="mr-2 h-4 w-4" />
          <span>Sprint</span>
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
              {filteredSprints.map((sprint: TSprint) => (
                <button
                  type="button"
                  key={sprint.id}
                  onClick={() => toggleSprint(sprint)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-1 px-4 py-2 text-sm',
                    selectedSprint?.id === sprint.id && 'bg-blue-100'
                  )}
                >
                  <div className="flex-1 text-left">
                    <p className="text-left font-medium">{sprint.name}</p>
                    <p className="text-muted-foreground text-left text-xs">
                      {sprint.startDate} ~ {sprint.endDate}
                    </p>
                  </div>
                  {selectedSprint?.id === sprint.id && <X className="h-4 w-4 text-blue-600" />}
                </button>
              ))}
              {filteredSprints.length === 0 && (
                <div className="px-4 py-2 text-sm text-gray-500">검색 결과가 없습니다.</div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        {selectedSprint ? (
          <div>
            <p className="text-sm">{selectedSprint.name}</p>
            <div>
              <p className="text-muted-foreground text-xs">
                {selectedSprint.startDate} ~ {selectedSprint.endDate}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-600">No sprint</p>
        )}
      </div>
    </div>
  );
}
