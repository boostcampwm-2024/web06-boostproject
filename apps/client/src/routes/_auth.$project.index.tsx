import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import ProjectOverview from '@/pages/ProjectOverview';

export const Route = createFileRoute('/_auth/$project/')({
  component: () => (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectOverview />
    </Suspense>
  ),
  errorComponent: () => (
    <div>
      <h2>Failed to load overview</h2>
      <p>Sorry, an unexpected error occured.</p>
    </div>
  ),
});
