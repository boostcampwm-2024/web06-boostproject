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

export const findDiff = (str1: string, str2: string) => {
  let startIndex = 0;
  let endIndex1 = 0;
  let endIndex2 = 0;

  while (
    startIndex < str1.length &&
    startIndex < str2.length &&
    str1[startIndex] === str2[startIndex]
  ) {
    startIndex += 1;
  }

  let backIndex1 = str1.length - 1;
  let backIndex2 = str2.length - 1;

  while (
    backIndex1 >= startIndex &&
    backIndex2 >= startIndex &&
    str1[backIndex1] === str2[backIndex2]
  ) {
    backIndex1 -= 1;
    backIndex2 -= 1;
  }

  endIndex1 = backIndex1 + 1;
  endIndex2 = backIndex2 + 1;

  return {
    position: startIndex,
    originalContent: str1.substring(startIndex, endIndex1),
    content: str2.substring(startIndex, endIndex2),
    length: str2.substring(startIndex, endIndex2).length,
  };
};
