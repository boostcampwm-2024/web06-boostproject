import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card.tsx';
import Tag from '@/shared/components/Tag.tsx';

export type Task = {
  id: number;
  title: string;
  description: string;
  sectionName: string;
  position: string;
};

interface TaskProps {
  task: Task;
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
      <CardFooter className="flex justify-start">
        <p className="text-gray-500">+ 서브 태스크 추가</p>
      </CardFooter>
    </Card>
  );
}

export default TaskCard;
