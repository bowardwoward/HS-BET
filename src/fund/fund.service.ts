import { AccountService } from '@/account/account.service';
import { AccountVerboseInfoSchemaType } from '@/schemas';
import { TransferPayload } from '@/schemas/transfer.payload.schema';
import { TransferRequestType } from '@/schemas/transfer.request.schema';
import { UserService } from '@/user/user.service';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';

@Injectable()
export class FundService {
  private readonly logger = new Logger(FundService.name, {
    timestamp: true,
  });
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly accountService: AccountService,
  ) {}

  async transferFunds(
    authUser: { sub: string; username: string },
    data: TransferRequestType,
  ): Promise<AccountVerboseInfoSchemaType> {
    const url = `${process.env.CBS_ENDPOINT}/transactions`;
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

    if (data.balance > Number(currentAccount.balance)) {
      throw new BadRequestException(
        'Your amount to send is greater than your balance',
      );
    }

    if (!user) {
      throw new ForbiddenException('You are not allowed to do that!');
    }

    const senderPayload: TransferPayload = {
      source: user.accountNumber,
      destination: data.destinationAccount,
      amount: String(data.balance || '0'),
      fee: '0',
      amountType: 'deduct',
      transactionType: 'TRANSFER-SEND',
      transactionDate: new Date().toISOString().split('T')[0],
      transactionDescription: data.description || '',
      transactionReferrenceNumber: 'OOGABOOGA',
      transactionChannel: 'INSTAPAY',
      transactionCode: '000000',
    };

    const recieverPayload: TransferPayload = {
      source: data.destinationAccount,
      destination: user.accountNumber,
      amount: String(data.balance || '0'),
      fee: '0',
      amountType: 'add',

      //   TODO: I DON'T KNOW WHAT THE FUCK THESE ARE LMAO
      transactionType: 'TRANSFER-SEND',
      transactionDate: new Date().toISOString().split('T')[0],
      transactionDescription: data.description || '',
      transactionReferrenceNumber: 'OOGABOOGA',
      transactionChannel: 'INSTAPAY',
      transactionCode: '000000',
    };

    await firstValueFrom(
      this.httpService.post<boolean>(url, senderPayload).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.code, url);
          throw new BadRequestException('Failed to deduct amount');
        }),
      ),
    );

    await firstValueFrom(
      this.httpService.post<boolean>(url, recieverPayload).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.code, url);
          throw new BadRequestException('Failed to fetch Client Account');
        }),
      ),
    );

    const updatedAccount = await this.accountService.getCurrentAccount(
      user?.accountNumber || '',
      user?.user_details.branch || '',
    );

    if (!updatedAccount) {
      throw new BadRequestException('Failed to fetch updated account');
    }

    return updatedAccount;
  }
}
