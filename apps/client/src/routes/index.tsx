import { createFileRoute, redirect } from '@tanstack/react-router';
import Home from '@/pages/Home';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: '/account',
      });
    }
  },
  component: Home,
});
