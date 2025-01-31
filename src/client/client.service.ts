import { EmailService } from '@/email/email.service';
import { EnvService } from '@/env/env.service';
import {
  AccountInfoSchemaType,
  AccountResponseSchemaType,
  OnboardingRequestSchemaType,
  ResponseSchemaType,
  accountResponseSchema,
  clientResponseSchema,
} from '@/schemas';
import { User } from '@/entities/user.entity';
import { UserDetail } from '@/entities/user.detail.entity';
import { UserAddress } from '@/entities/user.address.entity';
import { UserService } from '@/user/user.service';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { generateString } from '@/utils';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name, {
    timestamp: true,
  });

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserDetail)
    private userDetailsRepository: Repository<UserDetail>,
    @InjectRepository(UserAddress)
    private userAddressRepository: Repository<UserAddress>,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly configService: EnvService,
    private readonly emailService: EmailService,
  ) {}

  async createAccount(data: OnboardingRequestSchemaType): Promise<{
    cId: string;
    branch: string;
    username: string;
    message: string;
  }> {
    const endpointUrl = `${this.configService.get('CBS_ENDPOINT')}/clients`;
    const randomPassword = generateString(10);
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

    // Create user entity
    const user = new User();
    user.username = `${String(data.firstName).trim().toLocaleLowerCase()}.${String(data.lastName).trim().toLowerCase()}`;
    user.email = data.email;
    user.mobile = data.mobileNumber;
    user.password = randomPassword;
    user.accountNumber = `${CBSAccount.branchCode}${CBSAccount.account}`;
    user.accountId = CBSAccount.account;
    user.cId = value.cId;

    const savedUser = await this.usersRepository.save(user);

    // Create user address
    const userAddress = new UserAddress();
    userAddress.street = data.address.street || '';
    userAddress.barangay = data.address.barangay || '';
    userAddress.city = data.address.city || '';
    userAddress.country = data.address.country || '';
    userAddress.province = data.address.province || '';
    userAddress.zipCode = data.address.zipCode || '';
    userAddress.region = data.address.region || '';
    userAddress.user = savedUser;

    await this.userAddressRepository.save(userAddress);

    // Create user details
    const userDetails = new UserDetail();
    userDetails.firstName = data.firstName;
    userDetails.lastName = data.lastName;
    userDetails.dateOfBirth = new Date(data.dateOfBirth);
    userDetails.branch = value.branch;
    userDetails.user = savedUser;

    await this.userDetailsRepository.save(userDetails);

    await this.emailService.sendMail({
      to: data.email,
      subject: 'Account Enrollment',
      from: 'support@bet.com',
      text: `Hello ${user.username} here is your password to access the API: ${randomPassword}`,
    });

    return {
      ...value,
      username: user.username,
      message: 'User onboarded with account binded, please check your email',
    };
  }

  async fetchAccountNumber(
    cId: string,
    branchCode: string,
    accountType = 'SA',
  ): Promise<AccountInfoSchemaType> {
    const url = `${this.configService.get('CBS_ENDPOINT')}/accounts`;

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
    const url = `${this.configService.get('CBS_ENDPOINT')}/accounts/${dUser?.accountNumber}`;
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
