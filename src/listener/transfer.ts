import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { FundsTransferEvent } from '@/events';
import { FundsTransferConfirmationEvent } from '@/events';
import { EmailService } from '@/email/email.service';
import { TransactionsService } from '@/transactions/transactions.service';
import { HttpService } from '@nestjs/axios';
import { defaultTransferPayload, generateString } from '@/utils';
import * as argon2 from 'argon2';
import { EnvService } from '@/env/env.service';
import { TransferPayload } from '@/schemas/transfer.payload.schema';
import { AxiosError } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';

@Injectable()
export class TransferListener {
  constructor(
    private readonly emailService: EmailService,
    private readonly transactionService: TransactionsService,
    private readonly httpService: HttpService,
    private readonly configService: EnvService,
  ) {}

  private readonly url = `${this.configService.get('CBS_ENDPOINT')}/transactions`;

  @OnEvent('transfer.send-confirmation')
  async handleTransferReceiveConfirmation(
    event: FundsTransferConfirmationEvent,
  ) {
    new Logger().log('Transfer received:', event.data);
    new Logger().log('User:', event.user);

    const randomString = generateString(10);
    const hashedString = await argon2.hash(randomString);
    await this.transactionService.createTransactionToken({
      userId: event.user.id,
      amount: String(event.data.balance) || '0',
      sourceAccountNumber: event.user.accountNumber,
      destinationAccountNumber: event.data.destinationAccount,
      status: 'PENDING',
      description: 'Transfer from ' + event.user.accountNumber,
      hashedOtp: hashedString,
      otp: randomString,
    });

    await this.emailService.sendMail({
      from: this.configService.get('MAIL_FROM_ADDRESS'),
      to: event.user.email,
      subject: 'Transfer Confirmation',
      text: `You have initiated a transfer of ${event.data.balance} to ${event.data.destinationAccount}. Your OTP is ${randomString}`,
    });
  }

  @OnEvent('transfer.recieve-confirmation')
  async handleTransferSendConfirmation(event: FundsTransferEvent) {
    const data = await this.transactionService.verifyTransactionToken(
      event.otp,
    );

    if (!data) {
      throw new BadRequestException('Invalid OTP');
    }

    new Logger().log('Transfer sent:', data);

    const baseTransferPayload = {
      amount: String(data.amount || 0),
      ...defaultTransferPayload(event.user.accountNumber),
    };

    const payloads: TransferPayload[] = ['add', 'deduct'].map(
      (amountType: 'add' | 'deduct'): TransferPayload => ({
        ...baseTransferPayload,
        source:
          amountType === 'deduct'
            ? event.user.accountNumber
            : data.destinationAccountNumber,
        destination:
          amountType === 'deduct'
            ? data.destinationAccountNumber
            : event.user.accountNumber,
        amountType,
      }),
    );

    for (const payload of payloads) {
      await firstValueFrom(
        this.httpService.post<boolean>(this.url, payload).pipe(
          catchError((error: AxiosError) => {
            new Logger().error(error.code, this.url);
            throw new BadRequestException('Unable to transfer funds');
          }),
        ),
      );
    }

    await this.emailService.sendMail({
      from: this.configService.get('MAIL_FROM_ADDRESS'),
      to: event.user.email,
      subject: 'Transfer Confirmation',
      text: `You have received a transfer of ${data.amount} from ${event.user.accountNumber}`,
    });

    new Logger().log('Transfer completed:', data);

    // lastly delete the token
    await this.transactionService.deleteTransactionToken(event.otp);
  }
}
