import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './db/prisma.module';
import { UserController } from './user/user.controller';
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
import { EnvService } from './env/env.service';
import { EnvModule } from './env/env.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env/env';
import { EmailModule } from './email/email.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TransferListener } from './listener/transfer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './db/db';
import { User } from './entities/user.entity';
import { UserAddress } from './entities/user.address.entity';
import { UserDetail } from './entities/user.detail.entity';
import { Token } from './entities/token.entity';
import { UserService } from './user/user.service';

@Module({
  imports: [
    PrismaModule,
    TypeOrmModule.forRootAsync({
      imports: [EnvModule],
      useClass: TypeOrmConfig,
    }),
    TypeOrmModule.forFeature([User, UserAddress, UserDetail, Token]),
    HttpModule.register({
      headers: {
        'x-higala-username': process.env.API_USERNAME,
        'x-higala-password': process.env.API_PASSWORD,
      },
    }),
    AuthModule,
    UserModule,
    EnvModule,
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EmailModule,
    EventEmitterModule.forRoot(),
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
  providers: [
    AppService,
    UserService,
    AuthService,
    ClientService,
    FundService,
    TransactionsService,
    AccountService,
    EnvService,
    TransferListener,
    ClientService,
  ],
})
export class AppModule {}
