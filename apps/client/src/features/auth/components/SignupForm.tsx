import { AxiosError } from 'axios';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { signupFormSchema, SignupFormValues } from '@/features/auth/SignupFormSchema.ts';
import { useToast } from '@/lib/useToast.tsx';
import { useAuth } from '@/features/auth/useAuth.ts';

export function SignupForm() {
  const navigate = useNavigate({ from: '/signup' });

  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
  });

  const { registerMutation } = useAuth();

  const { mutate, isPending } = registerMutation;

  const onRegister = (data: SignupFormValues) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('Successfully registered');
        setTimeout(() => {
          navigate({ to: '/login' });
        }, 100);
      },
      onError,
    });
  };

  const onError = (error: AxiosError) => {
    if (error.response?.status === 409) {
      setError('username', {
        message: 'Username already exists',
      });
      return;
    }

    toast.error('Failed to register. Please try again later');
  };

  return (
    <form className="mb-4 bg-white px-8 pb-8 dark:bg-gray-800" onSubmit={handleSubmit(onRegister)}>
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
        <label htmlFor="passowrd">
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
      <div className="mb-4">
        <label htmlFor="password_confirm">
          <Input
            type="password"
            id="password_confirm"
            placeholder="비밀번호 확인"
            className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            {...register('passwordConfirm')}
          />
          {errors.passwordConfirm && (
            <span className="text-red-500">{errors.passwordConfirm.message}</span>
          )}
        </label>
      </div>
      <Button disabled={isPending} className="text-md h-12 w-full">
        {isPending ? '회원가입 중...' : '회원가입'}
      </Button>
    </form>
  );
}
