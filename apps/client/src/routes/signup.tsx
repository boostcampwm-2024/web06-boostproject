import { createFileRoute } from '@tanstack/react-router';
import Signup from '@/pages/Signup.tsx';

export const Route = createFileRoute('/signup')({
	component: Signup,
});
