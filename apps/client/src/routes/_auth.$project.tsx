import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/$project')({
	component: ProjectLayout,
});

function ProjectLayout() {
	const { project } = Route.useParams();

	return (
		<>
			<nav className="h-9 border-b px-6">
				<ul className="flex h-full items-center gap-4 text-sm">
					<li>
						<Link
							to="/$project"
							params={{ project }}
							activeOptions={{ exact: true }}
							className="[&.active]:font-semibold"
						>
							Overview
						</Link>
					</li>
					<li>
						<Link
							to="/$project/board"
							params={{ project }}
							activeOptions={{ exact: true }}
							className="[&.active]:font-semibold"
						>
							Board
						</Link>
					</li>
					<li>
						<Link
							to="/$project/settings"
							params={{ project }}
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
