import { createFileRoute } from '@tanstack/react-router';
import Home from '@/pages/Home.tsx';

export const Route = createFileRoute('/')({
	component: Home,
});
