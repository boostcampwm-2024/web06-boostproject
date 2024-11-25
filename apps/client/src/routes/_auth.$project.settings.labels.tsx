import { Suspense } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import LabelsSettings from '@/pages/LabelsSettings.tsx';

export const Route = createFileRoute('/_auth/$project/settings/labels')({
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
      <h2>Error Loading Labels</h2>
      <p>{error.message || 'Failed to load labels'}</p>
    </div>
  ),
  component: () => (
    <Suspense fallback={<div>Loading labels...</div>}>
      <LabelsSettings />
    </Suspense>
  ),
});
