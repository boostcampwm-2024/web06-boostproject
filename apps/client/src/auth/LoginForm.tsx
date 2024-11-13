import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoginSchema } from '@/auth/LoginSchema.ts';

export interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormProps {
  isPending: boolean;
  onSubmit: (data: LoginFormData) => void;
}

function LoginForm({ isPending, onSubmit }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  return (
    <form className="mb-4 bg-white px-8 pb-8 dark:bg-gray-800" onSubmit={handleSubmit(onSubmit)}>
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

export default LoginForm;
