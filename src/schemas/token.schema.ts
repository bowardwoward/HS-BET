import { z } from 'zod';

export const tokenSchema = z.object({
  token: z.string().min(1),
  refreshToken: z.string().min(1),
  userId: z.string().uuid(),
});

export type TokenSchemaType = z.infer<typeof tokenSchema>;
