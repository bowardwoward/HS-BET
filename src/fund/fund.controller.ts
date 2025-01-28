import { JwtGuard } from '@/auth/guards/jwt/jwt.guard';
import { GetUser } from '@/get-user/get-user.decorator';
import {
  ConfirmTransferRequestDTO,
  TransferRequestDTO,
  transferRequestSchema,
} from '@/schemas/transfer.request.schema';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FundService } from './fund.service';
import { ZodPipe } from '@/zod/zod.pipe';
import { z } from 'zod';

@Controller('fund')
export class FundController {
  constructor(private readonly fundService: FundService) {}
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('transfer')
  async transferFunds(
    @GetUser() user: { sub: string; username: string },
    @Body(new ZodPipe(transferRequestSchema))
    data: TransferRequestDTO,
  ) {
    return await this.fundService.transferFunds(user, data);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('confirm-transfer')
  async confirmTransfer(
    @GetUser() user: { sub: string; username: string },
    @Body(new ZodPipe(z.object({ otp: z.string() })))
    data: ConfirmTransferRequestDTO,
  ) {
    return await this.fundService.confirmTransfer(data.otp, user);
  }
}
