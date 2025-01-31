import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const resetPasswordPaylodSchema = z.object({
  token: z.string(),
  email: z.string().email(),
});

export const genericResponseSchema = z.object({
  message: z.string(),
});

export type GenericResponseSchemaType = z.infer<typeof genericResponseSchema>;

export class GenericResponseDTO extends createZodDto(genericResponseSchema) {}

export class ResetPasswordPayloadDTO extends createZodDto(
  resetPasswordPaylodSchema,
) {}
