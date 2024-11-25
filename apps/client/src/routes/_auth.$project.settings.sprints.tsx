import { Suspense } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import ProjectSprintsSettings from '@/pages/ProjectSprintsSettings.tsx';

export const Route = createFileRoute('/_auth/$project/settings/sprints')({
  beforeLoad: ({ params }) => {
    const projectId = Number(params.project);
    if (Number.isNaN(projectId)) {
      throw redirect({
        to: '/account',
      });
    }
  },
  loader: ({ params }) => {
    const projectId = Number(params.project);
    return { projectId };
  },
  errorComponent: ({ error }) => (
    <div>
      <h2>Error Loading Sprints</h2>
      <p>{error.message || 'Failed to load Sprints'}</p>
    </div>
  ),
  component: () => (
    <Suspense fallback={<div>Loading sprints...</div>}>
      <ProjectSprintsSettings />
    </Suspense>
  ),
});
