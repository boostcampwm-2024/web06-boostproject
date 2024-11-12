import { z } from 'zod';

export const SignupSchema = z
	.object({
		username: z
			.string()
			.min(8, {
				message: '아이디는 8자 이상이어야 합니다.',
			})
			.max(15, {
				message: '아이디는 15자 이하여야 합니다.',
			}),

		password: z
			.string()
			.min(8, {
				message: '비밀번호는 8자 이상이어야 합니다.',
			})
			.max(15, {
				message: '비밀번호는 15자 이하여야 합니다.',
			}),

		passwordConfirm: z.string().min(8, { message: '비밀번호 확인은 최소 8자 이상이어야 합니다.' }),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: '비밀번호가 일치하지 않습니다.',
		path: ['passwordConfirm'],
	});
