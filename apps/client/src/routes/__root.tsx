import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { AuthContextValue } from '@/features/auth/AuthProvider.tsx';
import { Toaster } from '@/components/ui/sonner.tsx';

interface RouterContext {
  auth: AuthContextValue;
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      <Toaster position="bottom-left" />
    </>
  ),
});
