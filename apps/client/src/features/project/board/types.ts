import { Assignee, BaseResponse, Label } from '@/features/types.ts';

export type Task = {
  id: number;
  title: string;
  sectionId: number;
  position: string;
  assignees: Assignee[];
  labels: Label[];
  statistic: {
    total: number;
    done: number;
  };
};

export type Section = {
  id: number;
  name: string;
  tasks: Task[];
};

export type TasksResponse = BaseResponse<Section[]>;

export enum TaskEventType {
  'TASK_CREATED' = 'TASK_CREATED',
  'TASK_DELETED' = 'TASK_DELETED',
  'TITLE_UPDATED' = 'TITLE_UPDATED',
  'POSITION_UPDATED' = 'POSITION_UPDATED',
  'ASSIGNEES_CHANGED' = 'ASSIGNEES_CHANGED',
  'LABELS_CHANGED' = 'LABELS_CHANGED',
  'SUBTASKS_CHANGED' = 'SUBTASKS_CHANGED',
}

export type TaskEvent = {
  event: TaskEventType;
  task: {
    id: number;
    title?: string;
    sectionId?: number;
    position?: string;
    assignees?: Assignee[];
    labels?: Label[];
    subtasks?: {
      total?: number;
      completed?: number;
    };
  };
};

export type EventResponse = BaseResponse<TaskEvent>;

export interface UpdateTitleDto {
  event: 'INSERT_TITLE' | 'DELETE_TITLE';
  taskId: number;
  title: {
    position: number;
    content: string;
    length: number;
  };
}

export interface CreateTaskDto {
  event: 'CREATE_TASK';
  sectionId: number;
  position: string;
}

export type CreateTaskResponse = BaseResponse<{
  id: number;
  position: string;
}>;

export interface UpdatePositionDto {
  event: 'UPDATE_POSITION';
  sectionId: number;
  taskId: number;
  position: string;
}

export type UpdateDto = UpdateTitleDto | CreateTaskDto | UpdatePositionDto;
