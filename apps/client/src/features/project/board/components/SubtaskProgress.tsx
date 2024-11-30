export function SubtaskProgress({ total, completed }: { total: number; completed: number }) {
  if (total === 0) return null;

  const percentage = Math.floor((completed / total) * 100);

  return (
    <div className="flex w-full items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="whitespace-nowrap text-xs text-gray-500">
        {completed}/{total}
      </span>
    </div>
  );
}
