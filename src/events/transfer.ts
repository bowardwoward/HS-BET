// import { TransferPayload } from '@/schemas/transfer.payload.schema';
import { User } from '@prisma/client';

export class FundsTransferEvent {
  constructor(
    public user: User,
    public otp: string,
  ) {}
}
