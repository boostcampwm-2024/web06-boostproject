import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { HarmonyWithText } from '@/components/logo';
import Header from '@/components/Header';
import Footer from '@/components/Footer.tsx';
import { SignupForm } from '@/features/auth/components/SignupForm.tsx';

export function Signup() {
  return (
    <div className="flex h-screen flex-col">
      <Header>
        <Header.Left>
          <Link to="/">
            <HarmonyWithText />
          </Link>
        </Header.Left>
        <Header.Right>
          <Button variant="outline" className="hover:bg-primary hover:text-white" asChild>
            <Link to="/login">Login</Link>
          </Button>
        </Header.Right>
      </Header>

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
