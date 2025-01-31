import { ClientService } from '@/client/client.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class IsActiveGuard implements CanActivate {
  constructor(private readonly clientService: ClientService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: { user?: { username: string; sub: string } } = context
      .switchToHttp()
      .getRequest();

    if (!request.user) {
      throw new ForbiddenException('User not found in request.');
    }
    const account = await this.clientService.getCBSAccount({
      username: request.user.username,
      sub: request.user.sub,
    });
    if (account.status !== 'ACTIVE')
      throw new ForbiddenException('Your account is not active.');

    return true;
  }
}
