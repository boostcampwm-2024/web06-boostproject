import { createFileRoute } from '@tanstack/react-router';

function RouteComponent() {
	return 'Hello /join!';
}

export const Route = createFileRoute('/join')({
	component: RouteComponent,
});
