import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { HarmonyWithText } from '@/components/logo';
import { Topbar } from '@/components/navigation/topbar';
import SignupForm, { SignupFormData } from '@/auth/SignupForm.tsx';
import Footer from '@/components/Footer.tsx';
import { useAuth } from '@/features/auth/useAuth.ts';

function Signup() {
  const navigate = useNavigate({ from: '/signup' });
  const { registerMutation } = useAuth();

  const { mutateAsync: signup, isPending } = registerMutation;

  const handleSubmit = async (signupFormData: SignupFormData) => {
    await signup({
      username: signupFormData.username,
      password: signupFormData.password,
    });

    setTimeout(() => {
      navigate({ to: '/login' });
    }, 100);
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
