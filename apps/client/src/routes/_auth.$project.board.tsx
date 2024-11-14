import { createFileRoute } from '@tanstack/react-router';
import Kanban from '@/shared/components/Kanban.tsx';

export const Route = createFileRoute('/_auth/$project/board')({
  component: Kanban,
});
