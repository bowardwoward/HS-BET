import { addressSchema } from '@/schemas';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const accountResponseSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  email: z.string().email(),
  mobileNumber: z.string(),
  address: addressSchema,
  branch: z.string(),
  cId: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  createDate: z.string().datetime(),
  updateDate: z.string().datetime(),
});

export const accountInfoSchema = z.object({
  account: z.string(),
  branchCode: z.string(),
  accountType: z.string(),
  balance: z.number(),
});

export type AccountResponseSchemaType = z.infer<typeof accountResponseSchema>;
export type AccountInfoSchemaType = z.infer<typeof accountInfoSchema>;

export class AccountResponseDTO extends createZodDto(accountResponseSchema) {}
