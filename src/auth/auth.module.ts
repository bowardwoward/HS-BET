import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { AuthService } from '@/auth/auth.service';
import { LocalStrategy } from '@/auth/strategy/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JWTStrategy } from './strategy/jwt.strategy';
import { RefreshTokenStrategy } from './strategy/refresh.strategy';
@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30m' },
    }),
  ],
  providers: [AuthService, JWTStrategy, RefreshTokenStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
