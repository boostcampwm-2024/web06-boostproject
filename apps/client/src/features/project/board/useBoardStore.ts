import { create } from 'zustand';
import { Section as TSection, Task, TaskEvent, TaskEventType } from './types';
import { findTask } from './utils';

interface BoardState {
  sections: TSection[];
  setSections: (sections: TSection[]) => void;
  handleEvent: (event: TaskEvent) => void;
  updateTaskPosition: (sectionId: number, taskId: number, position: string) => void;
  updateTaskTitle: (taskId: number, newTitle: string) => void;
  createTask: (sectionId: number, task: Task) => void;
  restoreState: (sections: TSection[]) => void;
  deleteTask: (taskId: number) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  sections: [] as TSection[],

  setSections: (sections) => set({ sections }),

  handleEvent: (event) => {
    set((state) => {
      let updatedSections = state.sections;

      switch (event.event) {
        case TaskEventType.TASK_CREATED:
          updatedSections = handleTaskCreated(state.sections, event);
          break;

        case TaskEventType.POSITION_UPDATED:
          updatedSections = handlePositionUpdated(state.sections, event);
          break;

        case TaskEventType.TITLE_UPDATED:
          updatedSections = handleTaskUpdated(state.sections, event);
          break;

        case TaskEventType.TASK_DELETED:
          updatedSections = handleTaskDeleted(state.sections, event);
          break;

        case TaskEventType.ASSIGNEES_CHANGED:
        case TaskEventType.LABELS_CHANGED:
        case TaskEventType.SUBTASKS_CHANGED:
          updatedSections = handleTaskUpdated(state.sections, event);
          break;

        default:
          break;
      }

      return {
        sections: sortSectionTasks(updatedSections),
      };
    });
  },

  updateTaskPosition: (sectionId: number, taskId: number, position: string) =>
    set((state) => {
      const task = findTask(state.sections, taskId);
      if (!task) return state;

      return {
        sections: state.sections.map((section) => {
          const filteredTasks = section.tasks.filter((t) => t.id !== taskId);

          if (section.id === sectionId) {
            return {
              ...section,
              tasks: [...filteredTasks, { ...task, position, sectionId }].sort((a, b) =>
                a.position.localeCompare(b.position)
              ),
            };
          }

          return {
            ...section,
            tasks: filteredTasks,
          };
        }),
      };
    }),

  updateTaskTitle: (taskId: number, newTitle: string) =>
    set((state) => ({
      sections: state.sections.map((section) => ({
        ...section,
        tasks: section.tasks.map((t) => (t.id === taskId ? { ...t, title: newTitle } : t)),
      })),
    })),

  createTask: (sectionId: number, task: Task) =>
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              tasks: [...section.tasks, task].sort((a, b) => a.position.localeCompare(b.position)),
            }
          : section
      ),
    })),

  deleteTask: (taskId: number) =>
    set((state) => ({
      sections: state.sections.map((section) => ({
        ...section,
        tasks: section.tasks.filter((t) => t.id !== taskId),
      })),
    })),

  restoreState: (sections: TSection[]) => set({ sections }),
}));

const handleTaskCreated = (sections: TSection[], event: TaskEvent): TSection[] => {
  return sections.map((section) =>
    section.id === event.task.sectionId
      ? {
          ...section,
          tasks: [
            ...section.tasks,
            {
              id: event.task.id,
              title: event.task.title ?? '',
              sectionId: event.task.sectionId!,
              position: event.task.position!,
              assignees: event.task.assignees ?? [],
              labels: event.task.labels ?? [],
              statistic: event.task.statistics ?? { total: 0, completed: 0 },
            } as Task,
          ],
        }
      : section
  );
};

const handlePositionUpdated = (sections: TSection[], event: TaskEvent): TSection[] => {
  const task = findTask(sections, event.task.id);
  if (!task) return sections;

  return sections.map((section) => {
    const filteredTasks = section.tasks.filter((t) => t.id !== task.id);

    if (section.id === event.task.sectionId) {
      return {
        ...section,
        tasks: [
          ...filteredTasks,
          {
            ...task,
            sectionId: event.task.sectionId!,
            position: event.task.position!,
          },
        ].sort((a, b) => a.position.localeCompare(b.position)),
      };
    }

    return {
      ...section,
      tasks: filteredTasks,
    };
  });
};

const handleTaskUpdated = (sections: TSection[], event: TaskEvent): TSection[] => {
  return sections.map((section) => ({
    ...section,
    tasks: section.tasks.map((task) =>
      task.id === event.task.id ? ({ ...task, ...event.task } as Task) : task
    ),
  }));
};

const handleTaskDeleted = (sections: TSection[], event: TaskEvent): TSection[] => {
  return sections.map((section) => ({
    ...section,
    tasks: section.tasks.filter((task) => task.id !== event.task.id),
  }));
};

const sortSectionTasks = (sections: TSection[]): TSection[] => {
  return sections.map((section) => ({
    ...section,
    tasks: [...section.tasks].sort((a, b) => a.position.localeCompare(b.position)),
  }));
};
