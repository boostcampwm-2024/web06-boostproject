import { createFileRoute } from '@tanstack/react-router';
import ProjectSettingsLayout from '@/pages/ProjectSettingsLayout.tsx';

export const Route = createFileRoute('/_auth/$project/settings')({
  component: ProjectSettingsLayout,
});
