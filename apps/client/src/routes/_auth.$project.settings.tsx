import { createFileRoute, Link, Outlet, useParams } from '@tanstack/react-router';
import { Calendar, Home, Tag, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_auth/$project/settings')({
  component: ProjectSettingsLayout,
  notFoundComponent: () => (
    <div className="flex h-full items-center justify-center p-4">
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

const SETTINGS_LINKS = [
  { href: './', label: 'General', icon: Home },
  { href: './labels', label: 'Labels', icon: Tag },
  { href: './sprints', label: 'Sprints', icon: Calendar },
];

function ProjectSettingsLayout() {
  const { project } = useParams({ from: '/_auth/$project/settings' });

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col">
      <div className="w-full border-b">
        <div className="mx-auto max-w-[1280px]">
          <div className="px-6 py-8">
            <h1 className="text-3xl">Settings</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-[1280px] flex-1">
        <div className="w-64 flex-shrink-0 border-r">
          <div className="px-6 py-6">
            <div className="w-full space-y-1">
              {SETTINGS_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  to={`/${project}/settings/${href}`}
                  className="flex items-center space-x-2 rounded-lg px-2 py-2 hover:bg-gray-100 [&.active]:font-semibold"
                  activeOptions={{ exact: true }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <div className="h-full overflow-y-auto px-6 py-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
