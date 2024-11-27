import { createFileRoute } from '@tanstack/react-router';
import ProjectOverview from '@/pages/ProjectOverview';

export const Route = createFileRoute('/_auth/$project/')({
  component: ProjectOverview,
});
