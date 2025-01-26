import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtGuard } from '@/auth/guards/jwt/jwt.guard';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import {
  TransactionListDTO,
  TransactionPayloadDTO,
  transactionsPayloadSchema,
} from '@/schemas/transaction.schema';
import { GetUser } from '@/get-user/get-user.decorator';
import { ZodPipe } from '@/zod/zod.pipe';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @Post('history')
  @ApiOkResponse({
    description: 'Returns an array of all your transactions',
    type: TransactionListDTO,
  })
  async transactions(
    @Body(new ZodPipe(transactionsPayloadSchema))
    payload: TransactionPayloadDTO,
    @GetUser() user: { sub: string; username: string },
  ) {
    return await this.transactionService.fetchTransactions(payload, user);
  }
}
