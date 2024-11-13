import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/account')({
  component: AccountLayout,
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
      <Outlet />
    </>
  );
}
