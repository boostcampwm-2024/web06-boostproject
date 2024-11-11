import * as React from 'react';
import { createFileRoute, Link, redirect, useRouter, useRouterState } from '@tanstack/react-router';
import { useAuth } from '@/contexts/authContext';
import { sleep } from '@/utils/sleep';
import { LogoWithText } from '@/components/logo';
import { Topbar } from '@/components/navigation/topbar';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/login')({
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: '/account' });
		}
	},
	component: LoginPage,
});

/* eslint-disable jsx-a11y/label-has-associated-control */
function LoginPage() {
	const auth = useAuth();
	const router = useRouter();
	const isLoading = useRouterState({ select: (s) => s.isLoading });
	const navigate = Route.useNavigate();
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const isLoggingIn = isLoading || isSubmitting;

	const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		setIsSubmitting(true);
		try {
			event.preventDefault();
			const data = new FormData(event.currentTarget);
			const fieldValue = data.get('username');
			if (!fieldValue) {
				return;
			}
			const username = fieldValue.toString();
			await auth.login(username);
			await router.invalidate();
			await sleep(1); // 상태 업데이트를 위한 임시 방편
			await navigate({ to: '/account' });
		} catch (error) {
			console.error('Error logging in: ', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="">
			<Topbar
				leftContent={
					<Link to="/">
						<LogoWithText />
					</Link>
				}
				rightContent={
					<Button variant="outline" asChild>
						<Link to="/join">회원가입</Link>
					</Button>
				}
			/>
			<h2 className="text-xl">로그인 페이지</h2>
			<form className="mt-4 max-w-lg" onSubmit={onFormSubmit}>
				<fieldset disabled={isLoggingIn} className="grid w-full gap-2">
					<div className="grid min-w-[300px] items-center gap-2">
						<label htmlFor="username-input" className="text-sm font-medium">
							Username
						</label>
						<input
							id="username-input"
							name="username"
							placeholder="Enter your name"
							type="text"
							className="w-full rounded-md border p-2"
							required
						/>
					</div>
					<button
						type="submit"
						className="w-full rounded-md bg-blue-500 px-4 py-2 text-white disabled:bg-gray-300 disabled:text-gray-500"
					>
						{isLoggingIn ? 'Loading...' : 'Login'}
					</button>
				</fieldset>
			</form>
		</div>
	);
}
/* eslint-disable jsx-a11y/label-has-associated-control */
