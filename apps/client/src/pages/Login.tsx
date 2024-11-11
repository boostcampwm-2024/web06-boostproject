import Header from '@/components/Header.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Github, Harmony } from '@/components/logo';

function Login() {
	return (
		<>
			<div className="flex h-screen flex-col">
				<Header />

				<main className="flex h-full items-center justify-center">
					<div className="w-full max-w-md">
						<div className="mb-8 text-center">
							<h1 className="text-3xl font-bold">Harmony 로그인</h1>
						</div>
						<form className="mb-4 bg-white px-8 pb-8 dark:bg-gray-800">
							<div className="mb-4">
								<Input
									type="id"
									id="username"
									placeholder="아이디"
									className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
							</div>
							<div className="mb-4">
								<Input
									type="password"
									id="password"
									placeholder="패스워드"
									className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								/>
							</div>

							<Button className="text-md h-12 w-full">로그인하기</Button>
						</form>
					</div>
				</main>
				<div className="flex h-24 w-full items-center justify-center border-y-2 bg-white dark:bg-gray-800">
					<Button variant="link" className="h-12 w-12 font-thin" asChild>
						<a href="/signup">아직 계정이 없으신가요? 회원가입하기</a>
					</Button>
				</div>
			</div>

			<footer className="flex min-h-[100px] w-full items-center justify-center bg-white p-5 text-gray-500 dark:bg-gray-800">
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
		</>
	);
}

export default Login;
