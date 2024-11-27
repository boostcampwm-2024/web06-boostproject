import { Assignee } from '@/features/types.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';

export function AssigneeAvatars({ assignees }: { assignees: Assignee[] }) {
  const limit = 2;
  const visibleAssignees = assignees.slice(0, limit);
  const remainingCount = assignees.length - limit;

  return (
    <div className="flex items-end">
      {visibleAssignees.map((assignee, index) => (
        <div
          key={assignee.id}
          className="relative -ml-4 first:ml-0"
          style={{ zIndex: visibleAssignees.length - index }}
        >
          <Avatar className="h-7 w-7 border border-white">
            <AvatarImage src={assignee.profileImage} alt={assignee.username} />
            <AvatarFallback className="border border-black bg-gray-100 text-xs">
              {assignee.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="relative -ml-1" style={{ zIndex: 0 }}>
          <Avatar className="h-7 w-7 border-2 border-white">
            <AvatarFallback className="bg-gray-100 text-sm font-medium text-gray-600">
              +{remainingCount}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
}
