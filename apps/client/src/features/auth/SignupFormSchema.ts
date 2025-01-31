import { z } from 'zod';

export const signupFormSchema = z
  .object({
    username: z
      .string()
      .min(6, {
        message: 'Username should be at least 6 characters.',
      })
      .max(15, {
        message: 'Username should be at most 15 characters.',
      })
      .refine((value) => /^\S+$/.test(value), {
        message: 'Username should not contain whitespace.',
      }),

    password: z
      .string()
      .min(8, {
        message: 'Password should be at least 8 characters.',
      })
      .max(15, {
        message: 'Password should be at most 15 characters.',
      })
      .refine((value) => /^\S+$/.test(value), {
        message: 'Password should not contain whitespace.',
      }),

    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

export type SignupFormValues = z.infer<typeof signupFormSchema>;
