import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_auth/account')({
  component: AccountLayout,
  notFoundComponent: () => (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center p-4">
      <Card className="w-full max-w-md border bg-white">
        <CardContent className="space-y-6 p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-900">Page not found</h2>
            <p className="text-sm text-gray-500">Sorry, the page could not be found.</p>
          </div>
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="hover:bg-[#f2f2f2] hover:text-black"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
});

function AccountLayout() {
  return (
    <>
      <nav className="h-9 border-b px-6">
        <ul className="flex h-full items-center gap-4 text-sm">
          <li>
            <Link
              to="/account"
              activeOptions={{ exact: true }}
              className="[&.active]:font-semibold"
            >
              Overview
            </Link>
          </li>
          <li>
            <Link
              to="/account/settings"
              activeOptions={{ exact: true }}
              className="[&.active]:font-semibold"
            >
              Settings
            </Link>
          </li>
        </ul>
      </nav>
      <main className="bg-surface min-h-[calc(100vh-100px)]">
        <Outlet />
      </main>
    </>
  );
}
