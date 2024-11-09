import { createFileRoute } from '@tanstack/react-router';

function RouteComponent() {
	return 'Hello Harmony!';
}

export const Route = createFileRoute('/')({
	component: RouteComponent,
});
