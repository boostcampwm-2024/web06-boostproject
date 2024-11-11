import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Github } from '@/components/logo';
import Header from '@/components/Header.tsx';

function Home() {
	const [isTop, setIsTop] = useState(true);

	const handleScroll = () => {
		setIsTop(window.scrollY === 0);
	};

	useEffect(() => {
		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	return (
		<div className="flex min-h-screen flex-col">
			<Header isTop={isTop} />

			<main className="mt-16 flex-grow bg-white text-black dark:bg-black dark:text-white">
				<section className="container mx-auto max-w-6xl from-pink-500 via-red-500 to-yellow-500 px-6 py-20 text-center">
					<h1 className="mb-6 text-3xl font-bold md:text-5xl">
						<span className="animate-gradient-rotate bg-gradient-conic via-purple-500-500 from-green-500 to-blue-500 bg-clip-text text-transparent">
							Plan.
							<br />
							Collaborate.
							<br />
							Estimate.
						</span>
					</h1>
					<p className="mb-8 break-keep text-lg text-gray-600 md:text-xl">
						Harmony 는 프로젝트 계획부터, 팀원 모두의 생각이 실시간으로 반영되는 협업 플랫폼입니다.
					</p>

					<div className="col-span-3 flex justify-center">
						<Button size="lg" className="rounded-full" asChild>
							<Link to="/login">로그인</Link>
						</Button>
						<Button variant="outline" size="lg" className="ml-4 rounded-full">
							데모보기
						</Button>
					</div>
				</section>

				<section className="container mx-auto max-w-6xl px-6 py-20">
					<div className="grid grid-cols-1 gap-8 break-keep md:grid-cols-3">
						<div className="hover:text-primary text-center">
							<h2 className="mb-4 text-2xl font-bold">Plan.</h2>
							<p>
								직관적인 인터페이스로 프로젝트의 일정과 작업을 체계적으로 관리하세요. 팀의 목표와
								마일스톤을 명확히 설정하고, 진행 상황을 한눈에 파악할 수 있습니다.
							</p>
						</div>
						<div className="hover:text-primary text-center">
							<h2 className="mb-4 text-2xl font-bold">Collaborate.</h2>
							<p>
								실시간 동시편집으로 팀원들의 아이디어와 업데이트가 즉시 반영됩니다. 시간과 장소에
								구애받지 않고, 모든 팀원이 함께 작업할 수 있는 진정한 협업 환경을 제공합니다.
							</p>
						</div>
						<div className="hover:text-primary text-center">
							<h2 className="mb-4 text-2xl font-bold">Estimate.</h2>
							<p>
								플래닝 포커를 통해 팀원들의 다양한 관점을 수렴하고 합리적인 일정을 산출합니다.
								실시간 추정 과정을 통해 더 정확하고 투명한 프로젝트 계획을 수립할 수 있습니다.
							</p>
						</div>
					</div>
				</section>
			</main>

			<footer className="bg-black p-5 text-white">
				<div className="container mx-auto flex max-w-6xl flex-col items-center justify-between md:flex-row">
					<div className="flex items-center space-x-4">
						<span>2024 Naver Boostcamp Project</span>
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

export default Home;
