import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CommonInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const now = Date.now();
    console.log(`Before... [${req.method}] ${req.url}`);

    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(`After... ${Date.now() - now}ms`),
        ),
      );
  }
}
