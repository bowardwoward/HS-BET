import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt/jwt.guard';
import { ZodPipe } from '@/zod/zod.pipe';
import { loginRequestSchema, LoginRequestSchemaType } from '@/schemas';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { LocalGuard } from './guards/local/local.guard';
import { RefreshTokenGuard } from './guards/refresh/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ schema: { example: { username: 'user', password: 'pass' } } })
  async login(
    @Body(new ZodPipe(loginRequestSchema)) body: LoginRequestSchemaType,
  ) {
    return this.authService.login(body.username, body.password);
  }

  @UseGuards(JwtGuard)
  @Get('me')
  @ApiBearerAuth()
  profile() {
    return {
      message: 'Success',
    };
  }

  @UseGuards(JwtGuard)
  @Get('logout')
  @ApiBearerAuth()
  async logout(@Req() req: { user: { sub: string } }) {
    try {
      await this.authService.logout(req.user['sub']);
      return { message: 'Logged out successfully' };
    } catch (error: unknown) {
      console.error(error);
      throw new UnauthorizedException('You cannot do that!');
    }
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  @ApiBearerAuth()
  async refreshTokens(
    @Req() req: { user: { sub: string; refreshToken: string } },
  ) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;

    return this.authService.refreshTokens(userId, refreshToken);
  }
}
