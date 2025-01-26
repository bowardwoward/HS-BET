import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { ClientService } from './client/client.service';
import { ClientController } from './client/client.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FundService } from './fund/fund.service';
import { FundController } from './fund/fund.controller';
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionsService } from './transactions/transactions.service';
import { AccountController } from './account/account.controller';
import { AccountService } from './account/account.service';

@Module({
  imports: [
    PrismaModule,
    HttpModule.register({
      headers: {
        'x-higala-username': process.env.API_USERNAME,
        'x-higala-password': process.env.API_PASSWORD,
      },
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [
    AppController,
    UserController,
    AuthController,
    ClientController,
    FundController,
    TransactionsController,
    AccountController,
  ],
  providers: [AppService, UserService, AuthService, ClientService, FundService, TransactionsService, AccountService],
})
export class AppModule {}
