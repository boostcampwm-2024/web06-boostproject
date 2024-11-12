import { createFileRoute } from '@tanstack/react-router';
import Kanban from '@/pages/Kanban.tsx';

export const Route = createFileRoute('/_auth/$project/board')({
	component: Kanban,
});
