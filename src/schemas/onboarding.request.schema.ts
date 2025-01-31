import { z } from 'zod';
import { addressSchema } from './address.schema';
import { detailSchema } from './details.schema';
import { createZodDto } from 'nestjs-zod';

export const onboardingRequestSchema = z.object({
  ...detailSchema.omit({ userId: true }).shape,
  email: z.string().email(),
  mobileNumber: z.string(),
  address: addressSchema,
});

export const onboardingResponseSchema = z.object({
  cId: z.string(),
  message: z.string(),
  branch: z.string(),
  username: z.string(),
});

export type OnboardingResponseSchemaType = z.infer<
  typeof onboardingResponseSchema
>;

export type OnboardingRequestSchemaType = z.infer<
  typeof onboardingRequestSchema
>;

export class OnboardingRequestDTO extends createZodDto(
  onboardingRequestSchema,
) {}

export class OnboardingResponseDTO extends createZodDto(
  onboardingResponseSchema,
) {}
