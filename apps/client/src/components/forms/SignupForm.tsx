import { Label } from '@radix-ui/react-label';
import { useForm } from '@/hooks/useForm.ts';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';

type SignupFormValues = {
	username: string;
	password: string;
	password_confirm: string;
};

function SignupForm() {
	const { values, errors, touched, handleChange } = useForm<SignupFormValues>(
		{
			username: '',
			password: '',
			password_confirm: '',
		},
		{
			username: {
				required: { value: true, message: '아이디를 입력해주세요.' },
				minLength: { value: 6, message: '아이디는 6자 이상이어야 합니다.' },
			},
			password: {
				required: { value: true, message: '비밀번호를 입력해주세요.' },
				minLength: { value: 8, message: '비밀번호는 8자 이상이어야 합니다.' },
				pattern: {
					value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
					message: '비밀번호는 숫자, 대소문자, 특수문자를 포함해야 합니다.',
				},
			},
			password_confirm: {
				required: { value: true, message: '비밀번호를 다시 입력해주세요.' },
				validate: {
					value: ((value: string) => value === values.password) as (value: string) => boolean,
					message: '비밀번호가 일치하지 않습니다.',
				},
			},
		}
	);

	return (
		<form className="mb-4 bg-white px-8 pb-8 dark:bg-gray-800">
			<div className="mb-4">
				{errors.username && touched.username && (
					<Label htmlFor="username " className="text-destructive pl-2 text-sm">
						{errors.username}
					</Label>
				)}
				<Input
					type="text"
					id="username"
					value={values.username}
					onChange={(e) => handleChange('username', e.target.value)}
					placeholder="아이디"
					className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>
			<div className="mb-4">
				{errors.password && touched.password && (
					<Label htmlFor="password" className="text-destructive pl-2 text-sm">
						{errors.password}
					</Label>
				)}
				<Input
					type="password"
					id="password"
					value={values.password}
					onChange={(e) => handleChange('password', e.target.value)}
					placeholder="비밀번호"
					className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>
			<div className="mb-4">
				{errors.password_confirm && touched.password_confirm && (
					<Label htmlFor="password_confirm" className="text-destructive pl-2 text-sm">
						{errors.password_confirm}
					</Label>
				)}
				<Input
					type="password"
					id="password_confirm"
					value={values.password_confirm}
					onChange={(e) => handleChange('password_confirm', e.target.value)}
					placeholder="비밀번호 확인"
					className="h-12 w-full dark:border-gray-600 dark:bg-gray-700 dark:text-white"
				/>
			</div>

			<Button className="text-md h-12 w-full">회원가입하기</Button>
		</form>
	);
}

export default SignupForm;
