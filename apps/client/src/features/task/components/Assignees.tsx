import { useState } from 'react';
import { Search, Settings, Users, X } from 'lucide-react';
import { useLoaderData } from '@tanstack/react-router';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Assignee } from '@/features/types';
import { useTaskMutations } from '@/features/task/useTaskMutations';

interface AssigneesProps {
  initialAssignees: Assignee[];
}

export default function Assignees({ initialAssignees }: AssigneesProps) {
  const { taskId } = useLoaderData({
    from: '/_auth/$project/board/$taskId',
  });
  // const { data: members = [] } = useProjectMembersQuery(projectId);
  const members: Assignee[] = [];
  const { updateAssignees } = useTaskMutations(taskId);

  const [selectedAssignees, setSelectedAssignees] = useState<Assignee[]>(initialAssignees);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = members.filter((member) =>
    member.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAssignee = (assignee: Assignee) => {
    const isSelected = selectedAssignees.some((a) => a.id === assignee.id);
    const newAssignees = isSelected
      ? selectedAssignees.filter((a) => a.id !== assignee.id)
      : [...selectedAssignees, assignee];

    setSelectedAssignees(newAssignees);
    updateAssignees.mutate(newAssignees.map((a) => a.id));
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
                  className="pl-10"
                  placeholder="Type to search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto py-1">
              {filteredMembers.map((member) => (
                <button
                  type="button"
                  key={member.id}
                  onClick={() => toggleAssignee(member)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-1 px-4 py-2 text-sm',
                    selectedAssignees.some((a) => a.id === member.id) && 'bg-blue-100'
                  )}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="border border-black">
                      {member.username.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="ml-2 font-medium">{member.username}</span>
                  {selectedAssignees.some((a) => a.id === member.id) && (
                    <X className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        {selectedAssignees.length > 0 ? (
          selectedAssignees.map((assignee) => (
            <div key={assignee.id} className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback className="border border-black">
                  {assignee.username.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{assignee.username}</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-600">No assignee</p>
        )}
      </div>
    </div>
  );
}
