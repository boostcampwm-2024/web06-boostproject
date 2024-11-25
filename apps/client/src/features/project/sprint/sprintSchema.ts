import { z } from 'zod';

export const sprintFormSchema = z.object({
  name: z.string().min(1, 'Sprint name is required'),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .refine((data) => data.from <= data.to, {
      message: 'End date must be after start date',
    }),
});

export type SprintFormValues = z.infer<typeof sprintFormSchema>;
