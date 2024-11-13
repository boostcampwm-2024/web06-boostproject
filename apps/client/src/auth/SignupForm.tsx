import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SignupSchema } from '@/auth/SignupSchema.ts';

export interface SignupFormData {
  username: string;
  password: string;
  passwordConfirm: string;
}

interface SignupFormProps {
  isPending: boolean;
  onSubmit: (data: SignupFormData) => void;
}

function SignupForm({ isPending, onSubmit }: SignupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupSchema),
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

export default SignupForm;
