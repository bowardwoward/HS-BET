import { Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtGuard } from '@/auth/guards/jwt/jwt.guard';
import { ZodPipe } from '@/zod/zod.pipe';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import {
  onboardingRequestSchema,
  AccountResponseDTO,
  OnboardingRequestDTO,
  OnboardingResponseDTO,
} from '@/schemas';
import { GetUser } from '@/get-user/get-user.decorator';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}
  @Post('/clients')
  @ApiOkResponse({
    description: 'Creates a new client account',
    type: OnboardingResponseDTO,
  })
  async createClient(
    @Body(new ZodPipe(onboardingRequestSchema))
    data: OnboardingRequestDTO,
  ) {
    return this.clientService.createAccount(data);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Retrieves the account details',
    type: AccountResponseDTO,
  })
  @Get('account')
  async getAccount(@GetUser() user: { sub: string; username: string }) {
    return this.clientService.getCBSAccount(user);
  }
}
