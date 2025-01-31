import { EnvService } from '@/env/env.service';
import { PrismaService } from '@/db/prisma.service';
import {
  TransactionListType,
  TransactionPayloadType,
  TransactionTokenType,
} from '@/schemas/transaction.schema';
import { UserService } from '@/user/user.service';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';
import * as argon2 from 'argon2';
import { TransferToken } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly configService: EnvService,
    private readonly prismaService: PrismaService,
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

  async createTransactionToken(
    data: TransactionTokenType,
  ): Promise<TransactionTokenType | null> {
    try {
      const result = await this.prismaService.transferToken.create({
        data,
      });
      return result;
    } catch (error) {
      new Logger().error(error);
      throw new BadRequestException('Failed to create transaction token');
    }
  }

  async verifyTransactionToken(otp: string): Promise<TransferToken> {
    try {
      const result = await this.prismaService.transferToken.findUnique({
        where: {
          otp,
        },
      });

      if (!result) {
        throw new BadRequestException('Invalid transaction token');
      }

      // Verify the OTP by comparing the hashed OTP
      const isValid = await argon2.verify(result.hashedOtp, otp);

      if (!isValid) {
        throw new BadRequestException('Invalid transaction token');
      }

      return result;
    } catch (error) {
      new Logger().error(error);
      throw new BadRequestException('Failed to verify transaction token');
    }
  }

  async deleteTransactionToken(otp: string): Promise<TransferToken> {
    try {
      const result = await this.prismaService.transferToken.delete({
        where: {
          otp,
        },
      });

      return result;
    } catch (error) {
      new Logger().error(error);
      throw new BadRequestException('Failed to delete transaction token');
    }
  }
}
