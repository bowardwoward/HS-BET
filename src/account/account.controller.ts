import { Controller, Get, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtGuard } from '@/auth/guards/jwt/jwt.guard';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { AccountListDTO, AccountVerboseDTO } from '@/schemas';
import { GetUser } from '@/get-user/get-user.decorator';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Retrieve your current account',
    type: AccountVerboseDTO,
  })
  @Get('current')
  async getCurrentAccount(@GetUser() user: { sub: string; username: string }) {
    return await this.accountService.getClientAccount(user);
  }

  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Retrieve a list of your accounts',
    type: AccountListDTO,
  })
  @Get('list')
  async getAccountList(@GetUser() user: { sub: string; username: string }) {
    return await this.accountService.getClientAccountList(user);
  }
}
