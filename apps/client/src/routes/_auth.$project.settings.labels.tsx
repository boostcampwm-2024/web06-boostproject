import { createFileRoute } from '@tanstack/react-router';
import ProjectLabelsSettings from '@/pages/ProjectLabelsSettings.tsx';

export const Route = createFileRoute('/_auth/$project/settings/labels')({
  component: ProjectLabelsSettings,
});
