import {
  AccountInfoSchemaType,
  AccountResponseSchemaType,
  OnboardingRequestSchemaType,
  ResponseSchemaType,
  accountResponseSchema,
  clientResponseSchema,
} from '@/schemas';
import { UserService } from '@/user/user.service';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name, {
    timestamp: true,
  });
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
  ) {}

  async createAccount(data: OnboardingRequestSchemaType): Promise<{
    cId: string;
    branch: string;
    password: string;
    username: string;
    message: string;
  }> {
    const endpointUrl = `${process.env.CBS_ENDPOINT}/clients`;

    const response = await firstValueFrom(
      this.httpService.post<ResponseSchemaType>(endpointUrl, data).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error);
          throw new BadRequestException(error.response?.data);
        }),
      ),
    );
    const value: ResponseSchemaType = {
      cId: response.data.cId,
      branch: response.data.branch,
    };
    const CBSAccount = await this.fetchAccountNumber(value.cId, value.branch);
    const validatedData = clientResponseSchema.safeParse(value);

    if (!CBSAccount) {
      throw new BadRequestException('No such account exist');
    }

    if (!validatedData.success) {
      throw new BadRequestException('API schema outdated');
    }

    // Create the user account
    const user = await this.userService.createUser({
      username: `${String(data.firstName).trim().toLocaleLowerCase()}.${String(data.lastName).trim().toLowerCase()}`,
      email: data.email,
      mobile: data.mobileNumber,
      password: 'defaultpassword123',
      accountNumber: `${CBSAccount.branchCode}${CBSAccount.account}`,
    });

    await this.userService.createUserAddress(user.id, {
      street: data.address.street || '',
      barangay: data.address.barangay || '',
      city: data.address.city || '',
      country: data.address.country || '',
      province: data.address.province || '',
      zipCode: data.address.zipCode || '',
      region: data.address.region || '',
    });

    await this.userService.createUserDetails(user.id, {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: new Date(data.dateOfBirth),
      branch: value.branch,
    });
    return {
      ...value,
      password: 'defaultpassword123',
      username: user.username,
      message:
        'User onboarded with account binded, please reset the password ASAP!',
    };
  }

  async fetchAccountNumber(
    cId: string,
    branchCode: string,
    accountType = 'SA',
  ): Promise<AccountInfoSchemaType> {
    const url = `${process.env.CBS_ENDPOINT}/accounts`;

    const response = await firstValueFrom(
      this.httpService
        .post<AccountInfoSchemaType>(url, {
          cId,
          branchCode,
          accountType,
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.code, url);
            throw new BadRequestException('Failed to fetch CBS account');
          }),
        ),
    );

    return response.data;
  }

  async getCBSAccount(user: {
    sub: string;
    username: string;
  }): Promise<AccountResponseSchemaType> {
    const dUser = await this.userService.getUserById(user.sub);
    const url = `${process.env.CBS_ENDPOINT}/accounts/${dUser?.accountNumber}`;
    const response = await firstValueFrom(
      this.httpService.get(url).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.code, url);
          throw new BadRequestException('Failed to fetch CBS account');
        }),
      ),
    );

    const validatedData = accountResponseSchema.safeParse(response.data);
    if (!validatedData.success) {
      this.logger.error(validatedData.error);
      throw new BadRequestException('API Schema outdated');
    }
    return validatedData.data;
  }
}
