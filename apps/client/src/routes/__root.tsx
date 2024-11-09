import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
	component: () => (
		<>
			<div className="flex gap-2 p-2">
				<Link to="/" className="[&.active]:font-bold">
					Harmony
				</Link>
				<Link to="/login" className="[&.active]:font-bold">
					Login
				</Link>
				<Link to="/join" className="[&.active]:font-bold">
					Join
				</Link>
			</div>
			<hr />
			<Outlet />
			<TanStackRouterDevtools />
		</>
	),
});
