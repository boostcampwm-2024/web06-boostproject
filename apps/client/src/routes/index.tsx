import { createFileRoute, Link } from '@tanstack/react-router';

function HomePage() {
	return (
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
	);
}

export const Route = createFileRoute('/')({
	component: HomePage,
});
