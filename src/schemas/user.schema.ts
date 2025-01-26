import { z } from 'zod';

export const userSchema = z.object({
  accountNumber: z.string().min(1, 'accountNumber must be supplied'),
  mobile: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  email: z.string().email(),
});

export type UserSchemaType = z.infer<typeof userSchema>;
