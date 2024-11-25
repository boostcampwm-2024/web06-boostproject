import { z } from 'zod';

export const labelFormSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(10, 'Label name is too long'),
  description: z.string().min(1, 'Label description is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
});

export type LabelFormValues = z.infer<typeof labelFormSchema>;
