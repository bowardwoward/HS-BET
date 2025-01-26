import { UserService } from '@/user/user.service';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userService.validateCredentials({
      username,
      password,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, username: user.username };
    const { accessToken, refreshToken } = await this.getTokens(
      payload.sub,
      payload.username,
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string) {
    return await this.userService.deleteTokens(userId);
  }

  async hashData(data: string) {
    return await argon2.hash(data);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.userService.updateToken(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: process.env.JWT_SECRET,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: process.env.JWT_SECRET,
        },
      ),
    ]);
    await this.userService.saveTokens({
      userId,
      accessToken,
      refreshToken: await this.hashData(refreshToken),
      expiresAt: new Date(),
    });

    return {
      refreshToken: await this.hashData(refreshToken),
      accessToken,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.getUserById(userId);
    const token = await this.userService.getUserTokens(userId);
    if (!user || !token) {
      throw new ForbiddenException('Access Denied');
    }

    const refreshTokenMatch = await argon2.verify(
      token.refreshToken,
      refreshToken,
    );

    if (!refreshTokenMatch) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.username);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}
