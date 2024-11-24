import { createFileRoute } from '@tanstack/react-router';
import ProjectSprintsSettings from '@/pages/ProjectSprintsSettings.tsx';

export const Route = createFileRoute('/_auth/$project/settings/sprints')({
  component: ProjectSprintsSettings,
});
