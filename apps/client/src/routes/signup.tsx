import { createFileRoute, redirect } from '@tanstack/react-router';
import Signup from '@/pages/Signup';

export const Route = createFileRoute('/signup')({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: '/account' });
		}
	},
	component: Signup,
});
