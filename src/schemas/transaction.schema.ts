import { z } from 'zod';
import { TransferPayloadSchema } from './transfer.payload.schema';
import { createZodDto } from 'nestjs-zod';

export const transactionSchema = z.object({
  id: z.string().uuid(),
  cId: z.string(),
  ...TransferPayloadSchema.shape,
  balance: z.string(),
  transactionReferrenceNumber: z.string().nullable(),
  transactionBankBic: z.string().nullable(),
  createDate: z.string().datetime(),
  updateDate: z.string().datetime(),
});

export const transactionsPayloadSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
  accountNumber: z.string().min(1),
  sortDirection: z.enum(['asc', 'desc']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const transactionListSchema = z.object({
  total: z.number(),
  result: z.array(transactionSchema),
});

export type TransactionPayloadType = z.infer<typeof transactionsPayloadSchema>;
export type TransactionType = z.infer<typeof transactionSchema>;
export type TransactionListType = z.infer<typeof transactionListSchema>;

export class TransactionPayloadDTO extends createZodDto(
  transactionsPayloadSchema,
) {}
export class TransactionListDTO extends createZodDto(transactionListSchema) {}
