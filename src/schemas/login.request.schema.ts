import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const loginRequestSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type LoginResponseSchemaType = z.infer<typeof loginResponseSchema>;

export type LoginRequestSchemaType = z.infer<typeof loginRequestSchema>;

export class LoginResponseDTO extends createZodDto(loginResponseSchema) {}
