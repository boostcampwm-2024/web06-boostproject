import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Github, Harmony, HarmonyWithText } from '@/components/logo';
import { Topbar } from '@/components/navigation/topbar';

import { SignupSchema } from '@/SignupSchema.ts';

interface SignupFormData {
	username: string;
	password: string;
	passwordConfirm: string;
}

function Signup() {
	const navigate = useNavigate({ from: '/signup' });

	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<SignupFormData>({
		resolver: zodResolver(SignupSchema),
	});

	const { isPending, mutate } = useMutation({
		mutationFn: ({ username, password }: { username: string; password: string }) =>
			axios.post('/api/auth/signup', { username, password }),
		onSuccess: (response) => {
			const { username } = response.data;

			// Modal 생성 후 수정
			alert(`회원가입 성공 ${username}님 환영합니다!`);

			navigate({ to: '/login' });
		},
		onError: (error) => {
			if (error.response.data.message === 'Already used email') {
				setError('username', { message: '이미 사용중인 아이디입니다.' });
				return;
			}

			alert('알 수 없는 오류가 발생했습니다.');
		},
	});

	const onSubmit = (signupFormData: SignupFormData) => {
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
					<form
						className="mb-4 bg-white px-8 pb-8 dark:bg-gray-800"
						onSubmit={handleSubmit(onSubmit)}
					>
						<div className="mb-4">
							<Input
								type="text"
								id="username"
								placeholder="아이디"
								className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								{...register('username')}
							/>
							{errors.username && (
								<label htmlFor="username" className="text-red-500">
									{errors.username.message}
								</label>
							)}
						</div>
						<div className="mb-4">
							<Input
								type="password"
								id="password"
								placeholder="비밀번호"
								className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								{...register('password')}
							/>
							{errors.password && (
								<label htmlFor="password" className="text-red-500">
									{errors.password.message}
								</label>
							)}
						</div>
						<div className="mb-4">
							<Input
								type="password"
								id="password_confirm"
								placeholder="비밀번호 확인"
								className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								{...register('passwordConfirm')}
							/>
							{errors.passwordConfirm && (
								<label htmlFor="password_confirm" className="text-red-500">
									{errors.passwordConfirm.message}
								</label>
							)}
						</div>
						<Button disabled={isPending} className="text-md h-12 w-full">
							{isPending ? '회원가입 중...' : '회원가입'}
						</Button>
					</form>
				</div>
			</main>
			<footer className="flex h-[100px] w-full items-center justify-center bg-white p-5 text-gray-500 dark:bg-gray-800">
				<div className="container mx-auto flex max-w-6xl flex-col items-center justify-between md:flex-row">
					<div className="flex items-center space-x-4">
						<div className="flex justify-center">
							<Harmony />
							<span className="pl-4">2024 Naver Boostcamp Project</span>
						</div>
					</div>
					<div className="mt-4 flex space-x-4 md:mt-0">
						<a
							target="_blank"
							rel="noreferrer"
							href="https://github.com/boostcampwm-2024/web06-harmony"
							className="hover:text-secondary"
						>
							<Github size={24} color="currentColor" />
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}

export default Signup;
