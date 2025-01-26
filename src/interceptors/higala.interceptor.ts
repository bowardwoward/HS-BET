import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
// Higala Fighter Pilot type beat
export class HigalaInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();

    // Modify or add headers
    request.headers['x-higala-username'] = process.env.API_USERNAME;
    request.headers['x-higala-password'] = process.env.API_PASSWORD;

    return next.handle().pipe(
      map((data): unknown => {
        return data; // Allow the request to proceed with the modified headers
      }),
    );
  }
}
