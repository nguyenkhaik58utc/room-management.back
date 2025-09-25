import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) =>
        JSON.parse(
          JSON.stringify(data, (_, value) =>
            typeof value === 'bigint' ? Number(value) : value
          )
        )
      )
    );
  }
}
