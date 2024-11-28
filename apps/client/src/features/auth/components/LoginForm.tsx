import { AxiosError } from 'axios';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { loginFormSchema, LoginFormValues } from '@/features/auth/LoginFormSchema.ts';
import { useAuth } from '@/features/auth/useAuth.ts';
import { useToast } from '@/lib/useToast.tsx';

export function LoginForm() {
  const navigation = useNavigate({ from: '/login' });

  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
  });

  const { loginMutation } = useAuth();

  const { mutate, isPending } = loginMutation;

  const onLogin = (data: LoginFormValues) => {
    mutate(data, {
      onSuccess: () => {
        setTimeout(() => {
          navigation({ to: '/account' });
        }, 100);
      },
      onError,
    });
  };

  const onError = (error: AxiosError) => {
    if (error.response?.status === 401) {
      setError('password', {
        message: 'Invalid username or password',
      });
      return;
    }

    if (error.response?.status === 400) {
      setError('password', {
        message: 'Invalid username or password',
      });
      return;
    }

    toast.error('Login Failed - Please try again later');
  };

  return (
    <form className="mb-4 bg-white px-8 pb-8 dark:bg-gray-800" onSubmit={handleSubmit(onLogin)}>
      <div className="mb-4">
        <label htmlFor="username">
          <Input
            type="text"
            id="username"
            placeholder="아이디"
            className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            {...register('username')}
          />
          {errors.username && <span className="text-red-500">{errors.username.message}</span>}
        </label>
      </div>
      <div className="mb-4">
        <label htmlFor="username">
          <Input
            type="password"
            id="password"
            placeholder="비밀번호"
            className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            {...register('password')}
          />
          {errors.password && <span className="text-red-500">{errors.password.message}</span>}
        </label>
      </div>
      <Button type="submit" className="h-12 w-full" disabled={isPending}>
        로그인
      </Button>
    </form>
  );
}
