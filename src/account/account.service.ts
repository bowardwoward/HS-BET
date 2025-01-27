import { EnvService } from '@/env/env.service';
import { AccountVerboseInfoSchemaType } from '@/schemas';
import { UserService } from '@/user/user.service';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';

@Injectable()
export class AccountService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly configService: EnvService,
  ) {}

  async getCurrentAccount(
    accountNumber: string,
    branchCode: string,
  ): Promise<AccountVerboseInfoSchemaType | null> {
    const url = `${this.configService.get('CBS_ENDPOINT')}/accounts/inquiry`;
    const response = await firstValueFrom(
      this.httpService
        .post<AccountVerboseInfoSchemaType>(url, {
          branchCode,
          account: accountNumber,
        })
        .pipe(
          catchError((error: AxiosError) => {
            Logger.error(error.code, url);
            throw new BadRequestException('Failed to fetch Client Account');
          }),
        ),
    );

    return response.data || null;
  }

  async getAccountList(
    cId: string,
    branchCode: string,
  ): Promise<AccountVerboseInfoSchemaType[] | null> {
    const url = `${process.env.CBS_ENDPOINT}/accounts/accountLists`;
    const response = await firstValueFrom(
      this.httpService
        .post<AccountVerboseInfoSchemaType[]>(url, {
          branchCode,
          cId,
        })
        .pipe(
          catchError((error: AxiosError) => {
            Logger.error(error.code, url);
            throw new BadRequestException('Failed to fetch Client Account');
          }),
        ),
    );

    return response.data || null;
  }

  async getClientAccount(user: {
    sub: string;
  }): Promise<AccountVerboseInfoSchemaType> {
    const authenticatedUser = await this.userService.getUserById(user.sub);

    const account = await this.getCurrentAccount(
      String(authenticatedUser?.accountId),
      String(authenticatedUser?.user_details.branch),
    );

    if (!account) {
      throw new BadRequestException('Account not found');
    }
    return account;
  }

  async getClientAccountList(user: {
    sub: string;
  }): Promise<AccountVerboseInfoSchemaType[]> {
    const authenticatedUser = await this.userService.getUserById(user.sub);

    const account = await this.getAccountList(
      String(authenticatedUser?.cId),
      String(authenticatedUser?.user_details.branch),
    );

    if (!account) {
      throw new BadRequestException('Account not found');
    }
    return account;
  }
}
