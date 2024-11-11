import Header from '@/components/Header.tsx';
import { Github, Harmony } from '@/components/logo';
import SignupForm from '@/components/forms/SignupForm.tsx';

function Signup() {
	return (
		<>
			<div className="flex h-screen flex-col">
				<Header />

				<main className="flex h-full items-center justify-center">
					<div className="w-full max-w-md rounded-2xl border">
						<div className="mb-8 pt-12 text-center">
							<h1 className="text-3xl font-bold">Harmony 시작하기</h1>
						</div>
						<SignupForm />
					</div>
				</main>
			</div>

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
		</>
	);
}

export default Signup;
