import { Module } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { LocalStrategy } from '@/auth/strategy/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JWTStrategy } from './strategy/jwt.strategy';
import { RefreshTokenStrategy } from './strategy/refresh.strategy';
import { EmailService } from '@/email/email.service';
import { EmailModule } from '@/email/email.module';
import { EnvModule } from '@/env/env.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30m' },
    }),
    EmailModule,
    EnvModule, // Add this to imports
  ],
  providers: [
    AuthService,
    EmailService,
    JWTStrategy,
    RefreshTokenStrategy,
    LocalStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
