import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { LogoWithText } from '@/components/logo';
import { Topbar } from '@/components/navigation/topbar';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/join')({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: '/account' });
		}
	},
	component: JoinPage,
});

function JoinPage() {
	return (
		<div>
			<Topbar
				leftContent={
					<Link to="/">
						<LogoWithText />
					</Link>
				}
				rightContent={
					<Button variant="outline" asChild>
						<Link to="/login">로그인</Link>
					</Button>
				}
			/>
			<h2>회원가입 페이지</h2>
		</div>
	);
}
