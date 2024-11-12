import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { HarmonyWithText } from '@/components/logo';
import { Topbar } from '@/components/navigation/topbar';
import SignupForm, { SignupFormData } from '@/auth/SignupForm.tsx';
import Footer from '@/components/Footer.tsx';

function Signup() {
	const navigate = useNavigate({ from: '/signup' });

	const { isPending, mutate } = useMutation({
		mutationFn: ({ username, password }: { username: string; password: string }) =>
			axios.post('/api/auth/signup', { username, password }),
		onSuccess: async (response) => {
			const { username } = response.data;

			alert(`회원가입 성공 ${username}님 환영합니다!`);

			await navigate({ to: '/login' });
		},
		onError: (error) => {
			if (error.response.data.message === 'Already used email') {
				alert('이미 사용중인 아이디입니다.');
				return;
			}

			alert('알 수 없는 오류가 발생했습니다.');
		},
	});

	const handleSubmit = (signupFormData: SignupFormData) => {
		mutate({
			username: signupFormData.username,
			password: signupFormData.password,
		});
	};

	return (
		<div className="flex h-screen flex-col">
			<Topbar
				leftContent={
					<Link to="/">
						<HarmonyWithText />
					</Link>
				}
				rightContent={
					<Button variant="outline" asChild>
						<Link to="/login">로그인</Link>
					</Button>
				}
			/>
			<main className="flex h-full items-center justify-center">
				<div className="w-full max-w-md rounded-2xl border">
					<div className="mb-8 pt-12 text-center">
						<h1 className="text-3xl font-bold">Harmony 시작하기</h1>
					</div>
					<SignupForm isPending={isPending} onSubmit={handleSubmit} />
				</div>
			</main>

			<Footer />
		</div>
	);
}

export default Signup;
