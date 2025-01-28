import { AccountService } from '@/account/account.service';
import { FundsTransferConfirmationEvent, FundsTransferEvent } from '@/events';
import { AccountVerboseInfoSchemaType } from '@/schemas';
import { TransferRequestType } from '@/schemas/transfer.request.schema';
import { UserService } from '@/user/user.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FundService {
  private readonly logger = new Logger(FundService.name, {
    timestamp: true,
  });
  constructor(
    private readonly userService: UserService,
    private readonly accountService: AccountService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async transferFunds(
    authUser: { sub: string; username: string },
    data: TransferRequestType,
  ): Promise<AccountVerboseInfoSchemaType & { message: string }> {
    const user = await this.userService.getUserById(authUser.sub);
    const currentAccount = await this.accountService.getCurrentAccount(
      String(user?.accountId) || '',
      user?.user_details.branch || '',
    );

    // First check for the account
    if (!currentAccount) {
      throw new BadRequestException(
        'You do not have any currently enrolled accounts',
      );
    }

    if (data.destinationAccount === user?.accountNumber) {
      throw new BadRequestException('You cannot transfer to your own account');
    }

    if (data.balance > Number(currentAccount.balance)) {
      throw new BadRequestException(
        'Your amount to send is greater than your balance',
      );
    }

    if (!user) {
      throw new ForbiddenException('You are not allowed to do that!');
    }

    // Call the event
    this.eventEmitter.emit(
      'transfer.send-confirmation',
      new FundsTransferConfirmationEvent(data, user),
    );

    const updatedAccount = await this.accountService.getCurrentAccount(
      user?.accountNumber || '',
      user?.user_details.branch || '',
    );

    if (!updatedAccount) {
      throw new BadRequestException('Failed to fetch updated account');
    }

    return {
      ...updatedAccount,
      message: 'Transfer confirmation sent',
    };
  }

  async confirmTransfer(
    otp: string,
    user: { sub: string; username: string },
  ): Promise<AccountVerboseInfoSchemaType> {
    const authUser = await this.userService.getUserById(user.sub);

    if (!authUser) {
      throw new ForbiddenException('You are not allowed to do that!');
    }

    // Call the event
    this.eventEmitter.emit(
      'transfer.recieve-confirmation',
      new FundsTransferEvent(authUser, otp),
    );

    const updatedAccount = await this.accountService.getCurrentAccount(
      authUser?.accountNumber || '',
      authUser?.user_details.branch || '',
    );

    if (!updatedAccount) {
      throw new BadRequestException('Failed to fetch updated account');
    }

    return updatedAccount;
  }
}
