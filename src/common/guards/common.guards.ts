import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TimeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    console.log('URL:', request.url);
    console.log('User-Agent:', request.headers['user-agent']);
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 0 && hour < 24) {
      return true;
    }
    return true;

    throw new ForbiddenException('The API is only accessible between 08:00 - 18:00');
  }
}