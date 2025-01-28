// import { TransferPayload } from '@/schemas/transfer.payload.schema';
import { TransferRequestType } from '@/schemas/transfer.request.schema';
import { User } from '@prisma/client';

export class FundsTransferConfirmationEvent {
  constructor(
    public data: TransferRequestType,
    public user: User,
  ) {}
}
