import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const resetPasswordPaylodSchema = z.object({
  token: z.string(),
  email: z.string().email(),
});

export class ResetPasswordPayloadDTO extends createZodDto(
  resetPasswordPaylodSchema,
) {}
