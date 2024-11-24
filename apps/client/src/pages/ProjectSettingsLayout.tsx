import { Link, Outlet, useParams } from '@tanstack/react-router';
import { Home, Tag, Calendar } from 'lucide-react';

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
        <div className="mx-auto max-w-screen-lg">
          <div className="px-6 py-8">
            <h1 className="text-3xl">Settings</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-screen-lg flex-1">
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

export default ProjectSettingsLayout;
