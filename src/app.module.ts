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
  ],
  providers: [AppService, UserService, AuthService, ClientService],
})
export class AppModule {}
