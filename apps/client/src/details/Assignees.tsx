import { Dispatch, SetStateAction, useState } from 'react';
import { Search, Settings, Users, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Assignee } from '@/details/types.tsx';
import { Input } from '@/components/ui/input.tsx';
import { cn } from '@/lib/utils';

interface AssigneesProps {
  assignees: Assignee[];
  selectedAssignees: number[];
  setSelectedAssignees: Dispatch<SetStateAction<number[]>>;
}

export default function Assignees({
  assignees,
  selectedAssignees,
  setSelectedAssignees,
}: AssigneesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssignees = assignees.filter((assignee) =>
    assignee.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAssignee = (assignee: Assignee) => {
    setSelectedAssignees((prev) =>
      prev.includes(assignee.id) ? prev.filter((id) => id !== assignee.id) : [...prev, assignee.id]
    );
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-muted-foreground flex items-center text-sm font-medium">
          <Users className="mr-2 h-4 w-4" />
          <span>Assignee</span>
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
                  className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  placeholder="Type to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto py-1">
              {filteredAssignees.map((assignee) => (
                <button
                  type="button"
                  key={assignee.id}
                  onClick={() => toggleAssignee(assignee)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-1 px-4 py-2 text-left text-sm transition-colors',
                    selectedAssignees.includes(assignee.id) && 'bg-blue-100'
                  )}
                  role="option"
                  aria-selected={selectedAssignees.includes(assignee.id)}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={assignee.avatar} />
                    <AvatarFallback className="border border-black">
                      {assignee.username.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-2 flex-1">
                    <span className="font-medium">{assignee.username}</span>
                  </div>
                  {selectedAssignees.includes(assignee.id) && (
                    <X className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col justify-start space-y-2">
        {selectedAssignees.length > 0 &&
          selectedAssignees.map((id) => {
            const assignee = assignees.find((a) => a.id === id);

            if (!assignee) return null;

            return (
              <div key={id} className="flex items-center gap-1">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={assignee.avatar} />
                  <AvatarFallback className="border border-black">
                    {assignee.username.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{assignee.username}</p>
                </div>
              </div>
            );
          })}

        {selectedAssignees.length === 0 && <p className="text-xs text-gray-600">No assignee</p>}
      </div>
    </div>
  );
}
