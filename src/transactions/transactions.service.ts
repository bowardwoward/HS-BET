import { EnvService } from '@/env/env.service';
import {
  TransactionListType,
  TransactionPayloadType,
} from '@/schemas/transaction.schema';
import { UserService } from '@/user/user.service';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly configService: EnvService,
  ) {}

  async fetchTransactions(
    payload: TransactionPayloadType,
    user: { sub: string },
  ): Promise<TransactionListType> {
    const url = `${this.configService.get('CBS_ENDPOINT')}/accounts/transactions`;
    const authenticatedUser = await this.userService.getUserById(user.sub);

    const body: TransactionPayloadType = {
      ...payload,
      accountNumber: authenticatedUser?.accountNumber || '',
    };
    const response = await firstValueFrom(
      this.httpService.post<TransactionListType>(url, body).pipe(
        catchError((error: AxiosError) => {
          Logger.error(error.code, url);
          throw new BadRequestException('Failed to fetch transaction history');
        }),
      ),
    );

    return response.data;
  }
}
