import { create } from 'zustand';
import { Section as TSection, Task, TaskEvent, TaskEventType } from './types';
import { findTask } from './utils';
import { Assignee, Label } from '@/features/types.ts';

export interface BoardState {
  sections: TSection[];
  setSections: (sections: TSection[]) => void;

  handleEvent: (event: TaskEvent) => void;
  updateTaskPosition: (sectionId: number, taskId: number, position: string) => void;
  updateTaskTitle: (taskId: number, newTitle: string) => void;
  createTask: (sectionId: number, task: Task) => void;
  restoreState: (sections: TSection[]) => void;
  deleteTask: (taskId: number) => void;

  updateTaskAssignees: (taskId: number, assignees: Assignee[]) => void;
  updateTaskLabels: (taskId: number, labels: Label[]) => void;
  updateTaskSubtasks: (taskId: number, subtasks: { total: number; completed: number }) => void;
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

        case TaskEventType.TITLE_INSERTED:
          updatedSections = handleTitleInserted(state.sections, event);
          break;

        case TaskEventType.TITLE_DELETED:
          updatedSections = handleTitleDeleted(state.sections, event);
          break;

        case TaskEventType.TASK_DELETED:
          updatedSections = handleTaskDeleted(state.sections, event);
          break;

        case TaskEventType.SUBTASKS_CHANGED:
          updatedSections = handleSubtasksChanged(state.sections, event);
          break;

        case TaskEventType.ASSIGNEES_CHANGED:
        case TaskEventType.LABELS_CHANGED:
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

  updateTaskAssignees: (taskId: number, assignees: Assignee[]) =>
    set((state) => ({
      sections: state.sections.map((section) => ({
        ...section,
        tasks: section.tasks.map((t) => (t.id === taskId ? { ...t, assignees } : t) as Task),
      })),
    })),

  updateTaskLabels: (taskId: number, labels: Label[]) =>
    set((state) => ({
      sections: state.sections.map((section) => ({
        ...section,
        tasks: section.tasks.map((t) => (t.id === taskId ? { ...t, labels } : t) as Task),
      })),
    })),

  updateTaskSubtasks: (taskId: number, subtasks: { total: number; completed: number }) =>
    set((state) => ({
      sections: state.sections.map((section) => ({
        ...section,
        tasks: section.tasks.map((t) => (t.id === taskId ? { ...t, subtasks } : t)),
      })),
    })),
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
              subtasks: event.task.subtasks ?? { total: 0, completed: 0 },
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

const handleTitleInserted = (sections: TSection[], event: TaskEvent): TSection[] => {
  return sections.map((section) => {
    const task = section.tasks.find((t) => t.id === event.task.id);

    const title = task?.title ?? '';
    const { position, content, length } = event.task.title!;
    const newTitle = title.slice(0, position) + content + title.slice(position + length);

    return {
      ...section,
      tasks: section.tasks.map((t) => (t.id === event.task.id ? { ...t, title: newTitle } : t)),
    };
  });
};

const handleTitleDeleted = (sections: TSection[], event: TaskEvent): TSection[] => {
  return sections.map((section) => {
    const task = section.tasks.find((t) => t.id === event.task.id);

    const title = task?.title ?? '';
    const { position, length } = event.task.title!;
    const newTitle = title.slice(0, position) + title.slice(position + length);

    return {
      ...section,
      tasks: section.tasks.map((t) => (t.id === event.task.id ? { ...t, title: newTitle } : t)),
    };
  });
};

const handleSubtasksChanged = (sections: TSection[], event: TaskEvent): TSection[] => {
  return sections.map((section) => ({
    ...section,
    tasks: section.tasks.map((task) =>
      task.id === event.task.id
        ? ({
            ...task,
            subtasks: {
              total: event.task.subtasks!.total,
              completed: event.task.subtasks!.completed,
            },
          } as Task)
        : task
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
