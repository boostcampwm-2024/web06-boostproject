import { createFileRoute, redirect } from '@tanstack/react-router';

import Login from '@/features/auth/Login.tsx';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/account' });
    }
  },
  component: Login,
});
