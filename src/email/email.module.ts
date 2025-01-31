import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtModule } from '@nestjs/jwt';
import { EnvModule } from '@/env/env.module';
import { UserService } from '@/user/user.service';
import { EnvService } from '@/env/env.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '@/entities/token.entity';
import { UserAddress } from '@/entities/user.address.entity';
import { UserDetail } from '@/entities/user.detail.entity';
import { User } from '@/entities/user.entity';

@Module({
  imports: [
    JwtModule,
    EnvModule,
    TypeOrmModule.forFeature([User, UserAddress, UserDetail, Token]),
  ],
  providers: [EmailService, UserService, EnvService],
  exports: [EmailService],
})
export class EmailModule {}
