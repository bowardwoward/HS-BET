import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/entities/user.entity';
import { UserAddress } from '@/entities/user.address.entity';
import { UserDetail } from '@/entities/user.detail.entity';
import { Token } from '@/entities/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAddress, UserDetail, Token])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
