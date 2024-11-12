import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { HarmonyWithText } from '@/components/logo';
import { Topbar } from '@/components/navigation/topbar';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({
				to: '/account',
			});
		}
	},
	component: HomePage,
});

function HomePage() {
	return (
		<div>
			<Topbar
				leftContent={
					<Link to="/">
						<HarmonyWithText />
					</Link>
				}
				rightContent={
					<>
						<Button variant="outline" asChild>
							<Link to="/login">로그인</Link>
						</Button>
						<Button asChild>
							<Link to="/join">회원가입</Link>
						</Button>
					</>
				}
			/>
			<h2>랜딩 페이지</h2>
		</div>
	);
}
