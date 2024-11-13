import { Link } from '@tanstack/react-router';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Github, Harmony, HarmonyWithText } from '@/components/logo';
import { Topbar } from '@/components/navigation/topbar';

function Signup() {
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
              <Link to="/login">로그인</Link>
            </Button>
          }
        />

        <main className="flex h-full items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border">
            <div className="mb-8 pt-12 text-center">
              <h1 className="text-3xl font-bold">Harmony 시작하기</h1>
            </div>
            <form className="mb-4 bg-white px-8 pb-8 dark:bg-gray-800">
              <div className="mb-4">
                <Input
                  type="text"
                  id="username"
                  placeholder="아이디"
                  className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <Input
                  type="password"
                  id="password"
                  placeholder="비밀번호"
                  className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <Input
                  type="password"
                  id="password_confirm"
                  placeholder="비밀번호 확인"
                  className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <Button className="text-md h-12 w-full">회원가입하기</Button>
            </form>
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
