import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtModule } from '@nestjs/jwt';
import { EnvModule } from '@/env/env.module';
import { UserService } from '@/user/user.service';
import { EnvService } from '@/env/env.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [JwtModule, EnvModule, PrismaModule],
  providers: [EmailService, UserService, EnvService],
  exports: [EmailService],
})
export class EmailModule {}
