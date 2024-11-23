import { Dispatch, SetStateAction, useState } from 'react';
import { Settings, Calendar, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sprint as TSprint } from '@/details/types.tsx';
import { cn } from '@/lib/utils.ts';

interface SprintProps {
  sprints: TSprint[];
  selectedSprint: TSprint | null;
  setSelectedSprint: Dispatch<SetStateAction<TSprint | null>>;
}

export default function Sprint({ sprints, selectedSprint, setSelectedSprint }: SprintProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSprints = sprints.filter((sprint) =>
    sprint.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSprint = (sprint: TSprint) => {
    setSelectedSprint((prev) => (prev?.id === sprint.id ? null : sprint));
    setIsOpen(false);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-muted-foreground flex items-center text-sm font-medium">
          <Calendar className="mr-2 h-4 w-4" />
          <span>스프린트</span>
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
                  placeholder="스프린트 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredSprints.map((sprint) => (
                <button
                  type="button"
                  key={sprint.id}
                  onClick={() => toggleSprint(sprint)}
                  className={cn(
                    'flex cursor-pointer items-center gap-1 px-4 py-2 text-sm',
                    selectedSprint?.id === sprint.id && 'bg-blue-100'
                  )}
                >
                  <div className="flex-1">
                    <p className="font-medium">{sprint.name}</p>
                    <p className="text-muted-foreground text-xs">
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
          <p className="text-xs text-gray-600">스프린트가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
