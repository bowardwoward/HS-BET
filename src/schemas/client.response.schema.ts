import { z } from 'zod';

export const clientResponseSchema = z.object({
  cId: z.string().min(1),
  branch: z.string().min(1),
});

export type ResponseSchemaType = z.infer<typeof clientResponseSchema>;
