import { createFileRoute, redirect } from '@tanstack/react-router';

import Login from '@/pages/Login';

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/account' });
    }
  },
  component: Login,
});
