import { Link, useNavigate, useRouter, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Github, Harmony, HarmonyWithText } from '@/components/logo';
import { Topbar } from '@/components/navigation/topbar';
import { useAuth } from '@/contexts/authContext';
import { sleep } from '@/utils/sleep';

function Login() {
  const auth = useAuth();
  const router = useRouter();
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    <>
      <div className="flex h-screen flex-col">
        <Topbar
          leftContent={
            <Link to="/">
              <HarmonyWithText />
            </Link>
          }
          rightContent={
            <Button variant="outline" asChild>
              <Link to="/signup">회원가입</Link>
            </Button>
          }
        />

        <main className="flex h-full items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold">Harmony 로그인</h1>
            </div>
            <form className="mb-4 bg-white px-8 pb-8 dark:bg-gray-800" onSubmit={onFormSubmit}>
              <div className="mb-4">
                <Input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="아이디"
                  className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="패스워드"
                  className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <Button className="text-md h-12 w-full" type="submit">
                {isLoggingIn ? 'Loading...' : 'Login'}
              </Button>
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
