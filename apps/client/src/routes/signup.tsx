import { createFileRoute } from '@tanstack/react-router';

function RouteComponent() {
	return 'Hello /signup!';
}

export const Route = createFileRoute('/signup')({
	component: RouteComponent,
});
