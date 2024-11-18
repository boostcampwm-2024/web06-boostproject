import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import Tag from '@/components/Tag.tsx';
import { TTask } from '@/types';

interface TaskProps {
  task: TTask;
}

function TaskCard({ task }: TaskProps) {
  return (
    <Card className="bg-white transition-all duration-300">
      <CardHeader className="flex flex-row items-start gap-2">
        <CardTitle className="text-md mt-1.5 flex flex-1 break-keep">{task.title}</CardTitle>
        <div className="mt-0 inline-flex h-8 w-8 rounded-full bg-amber-200" />
      </CardHeader>
      <CardContent className="flex gap-1">
        <Tag text="Feature" />
        <Tag text="FE" className="bg-pink-400" />
      </CardContent>
    </Card>
  );
}

export default TaskCard;
