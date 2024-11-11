import { Link, useRouterState } from '@tanstack/react-router';
import { Harmony } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
	isTop?: boolean;
	className?: string;
}

function Header({ isTop = true, className }: HeaderProps) {
	const router = useRouterState();
	const { pathname } = router.location;

	const isLoginPage = pathname === '/login';
	const isSignupPage = pathname === '/signup';

	const headerClasses = cn(
		'fixed top-0 w-full h-16',
		'flex items-center justify-between',
		'px-6 bg-white dark:bg-black',
		'text-black dark:text-white',
		'transition-all duration-200',
		{
			'border-b border-gray-200 dark:border-gray-800 shadow-sm': !isTop,
		},
		className
	);

	return (
		<header className={headerClasses}>
			{/* Logo Section */}
			<div className="flex items-center space-x-4">
				<Link to="/" className="transition-opacity hover:opacity-80">
					<Harmony size={32} />
				</Link>
			</div>

			{/* Navigation Buttons */}
			<nav className="flex items-center space-x-3">
				{!isLoginPage && (
					<Button variant={isSignupPage ? 'outline' : 'ghost'} asChild>
						<Link to="/login" className="hover:text-primary font-medium transition-colors">
							로그인
						</Link>
					</Button>
				)}

				{!isSignupPage && (
					<Button variant="outline" asChild>
						<Link to="/signup" className="hover:text-primary font-medium transition-colors">
							회원가입
						</Link>
					</Button>
				)}
			</nav>
		</header>
	);
}

export default Header;
