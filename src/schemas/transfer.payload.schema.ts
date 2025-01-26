import { z } from 'zod';

export const TransferPayloadSchema = z.object({
  source: z.string().min(1),
  destination: z.string().min(1),
  amount: z.string().min(1),
  fee: z.string(),
  amountType: z.enum(['add', 'deduct']),
  transactionType: z.string().min(1),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  transactionDescription: z.string().min(1),
  transactionReferrenceNumber: z.string().min(1),
  transactionChannel: z.string().min(1),
  transactionCode: z.string().min(1),
});

export type TransferPayload = z.infer<typeof TransferPayloadSchema>;
