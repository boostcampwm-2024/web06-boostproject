import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button.tsx';
import { HarmonyWithText } from '@/components/logo';
import { Topbar } from '@/components/navigation/topbar';
import Footer from '@/components/Footer.tsx';
import LoginForm, { LoginFormData } from '@/auth/LoginForm.tsx';
import { useAuth } from '@/features/auth/useAuth.ts';

function Login() {
  const navigate = useNavigate({
    from: '/login',
  });
  const { loginMutation } = useAuth();

  const { mutateAsync: login, isPending } = loginMutation;

  const handleSubmit = async (loginFormData: LoginFormData) => {
    await login({
      username: loginFormData.username,
      password: loginFormData.password,
    });

    setTimeout(() => {
      navigate({ to: '/account' });
    }, 100);
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
            <LoginForm isPending={isPending} onSubmit={handleSubmit} />
          </div>
        </main>
        <div className="flex h-24 w-full items-center justify-center border-y-2 bg-white dark:bg-gray-800">
          <Button variant="link" className="h-12 w-12 font-thin" asChild>
            <a href="/signup">아직 계정이 없으신가요? 회원가입하기</a>
          </Button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default Login;
