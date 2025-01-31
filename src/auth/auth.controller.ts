import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt/jwt.guard';
import { ZodPipe } from '@/zod/zod.pipe';
import {
  loginRequestSchema,
  LoginRequestSchemaType,
  LoginResponseDTO,
} from '@/schemas';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { LocalGuard } from './guards/local/local.guard';
import { RefreshTokenGuard } from './guards/refresh/refresh.guard';
import { GenericResponseDTO } from '@/schemas/reset-password.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ schema: { example: { username: 'user', password: 'pass' } } })
  @ApiOkResponse({
    description: 'Returns access and refresh tokens',
    type: LoginResponseDTO,
  })
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
      new Logger().error(error);
      throw new UnauthorizedException('You cannot do that!');
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'When you forgot your password LMAO!' })
  @ApiBody({ schema: { example: { email: 'user@test.com' } } })
  async forgotPassword(
    @Body(new ZodPipe(z.object({ email: z.string().email() })))
    body: {
      email: string;
    },
  ) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password using token from query and new password from body',
  })
  @ApiBody({ schema: { example: { password: 'newPassword123' } } })
  @ApiOkResponse({
    description: 'Returns a message if successful',
    type: GenericResponseDTO,
  })
  async resetPassword(
    @Query('token') token: string,
    @Body() { password }: { password: string },
  ): Promise<{ message: string } | null> {
    return this.authService.resetPassword(token, password);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns access and refresh tokens',
    type: LoginResponseDTO,
  })
  async refreshTokens(
    @Req() req: { user: { sub: string; refreshToken: string } },
  ) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;

    return this.authService.refreshTokens(userId, refreshToken);
  }
}
