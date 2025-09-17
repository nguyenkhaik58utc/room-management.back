import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logDir = path.join(__dirname, '../../../logs'); // folder logs

  constructor() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const now = Date.now();

    const appName = 'room-management';
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    //const logFile = path.join(this.logDir, `${appName}-${dateStr}.log`);

    // const writeLog = (message: string) => {
    //   fs.appendFileSync(logFile, message + '\n', 'utf8');
    // };
    const writeLog = (message: string) => {
      console.log(`[${appName}-${dateStr}] ${message}`);
    };

    writeLog(`[Request] ${method} ${url} - body: ${JSON.stringify(req.body)}`);

    return next.handle().pipe(
      tap((data) => {
        writeLog(
          `[Response] ${method} ${url} - ${Date.now() - now}ms - response: ${JSON.stringify(
            data,
          )}`,
        );
      }),
    );
  }
}
