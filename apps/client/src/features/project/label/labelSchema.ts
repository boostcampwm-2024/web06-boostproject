import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(1, 'Label name is required'),
  description: z.string().min(1, 'Label description is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
});

export type LabelFormValues = z.infer<typeof formSchema>;
