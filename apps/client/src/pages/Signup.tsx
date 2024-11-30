import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { HarmonyWithText } from '@/components/logo';
import { Topbar } from '@/components/navigation/topbar';
import Footer from '@/components/Footer.tsx';
import { SignupForm } from '@/features/auth/components/SignupForm.tsx';

export function Signup() {
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
            <Link to="/login">Login</Link>
          </Button>
        }
      />
      <main className="flex h-full items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border">
          <div className="mb-8 pt-12 text-center">
            <h1 className="text-3xl font-bold">Harmony Register</h1>
          </div>
          <SignupForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
