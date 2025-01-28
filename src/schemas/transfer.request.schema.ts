import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const transferRequestSchema = z.object({
  destinationAccount: z.string(),
  balance: z.number(),
  description: z.string().optional(),
});

export type TransferRequestType = z.infer<typeof transferRequestSchema>;

export class TransferRequestDTO extends createZodDto(transferRequestSchema) {}

export class ConfirmTransferRequestDTO extends createZodDto(
  z.object({
    otp: z.string(),
  }),
) {}
