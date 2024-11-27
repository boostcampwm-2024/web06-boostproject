import { LexoRank } from 'lexorank';
import { Section as TSection, Task } from '@/features/project/board/types.ts';

export const calculatePosition = (tasks: Task[], belowTaskId: number): string => {
  const { length } = tasks;
  if (length === 0) {
    return LexoRank.middle().toString();
  }

  if (belowTaskId === -1) {
    return LexoRank.parse(tasks[length - 1].position)
      .genNext()
      .toString();
  }

  const belowTaskIndex = tasks.findIndex((task) => task.id === belowTaskId);
  const belowTask = tasks[belowTaskIndex];

  if (belowTaskIndex === 0) {
    return LexoRank.parse(belowTask.position).genPrev().toString();
  }

  return LexoRank.parse(tasks[belowTaskIndex - 1].position)
    .between(LexoRank.parse(belowTask.position))
    .toString();
};

export const findTask = (sections: TSection[], taskId: number): Task | undefined =>
  sections.flatMap((section) => section.tasks).find((task) => task.id === taskId);
