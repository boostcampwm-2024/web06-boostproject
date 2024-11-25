import { createFileRoute, redirect } from '@tanstack/react-router';
import { Suspense } from 'react';
import { TaskDetail } from '@/pages/TaskDetail.tsx';

export const Route = createFileRoute('/_auth/$project/board/$taskId')({
  beforeLoad: ({ params }) => {
    const projectId = Number(params.project);
    if (Number.isNaN(projectId)) {
      throw redirect({
        to: '/account',
      });
    }

    const taskId = Number(params.taskId);
    if (Number.isNaN(taskId)) {
      throw redirect({
        to: '/account',
      });
    }
  },
  loader: ({ params }) => {
    const projectId = Number(params.project);
    const taskId = Number(params.taskId);
    return { projectId, taskId };
  },
  errorComponent: ({ error }) => (
    <div>
      <h2>Error Loading TaskDetails</h2>
      <p>{error.message || 'Failed to load Task Detail'}</p>
    </div>
  ),
  component: () => (
    <Suspense fallback={<div>Loading task details...</div>}>
      <TaskDetail />
    </Suspense>
  ),
});
