import { createFileRoute } from '@tanstack/react-router';
import ProjectOverview from '@/pages/ProjectOVerview';

export const Route = createFileRoute('/_auth/$project/')({
  component: ProjectOverview,
});
