import { createFileRoute } from '@tanstack/react-router';

function RouteComponent() {
	return 'Hello /login!';
}

export const Route = createFileRoute('/login')({
	component: RouteComponent,
});
