import { z } from 'zod';

export const detailSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  branch: z.string(),
  userId: z.string().uuid(),
});

export type DetailSchemaType = z.infer<typeof detailSchema>;
