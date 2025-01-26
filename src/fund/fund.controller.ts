import { JwtGuard } from '@/auth/guards/jwt/jwt.guard';
import { GetUser } from '@/get-user/get-user.decorator';
import {
  TransferRequestDTO,
  transferRequestSchema,
} from '@/schemas/transfer.request.schema';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { FundService } from './fund.service';
import { ZodPipe } from '@/zod/zod.pipe';

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
}
