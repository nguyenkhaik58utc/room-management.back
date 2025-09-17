import { TokenService } from '../../token/token.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: TokenService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.log('Token:', token);
    try {
      const user = await this.tokenService.verifyAccessToken(token);
      req['user'] = user;
      console.log('Authenticated user:', user);
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token: ' + err.message });
    }
  }
}
