import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}
  async verifyAccessToken(token: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verify(token, {
        secret: process.env.JWT_KEY,
      });
      return {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
      };
    } catch (err) {
      throw new UnauthorizedException(
        'Invalid or expired token: ' + err.message,
      );
    }
  }

  generateAccessToken(payload: any) {
    return this.jwtService.sign(
      {
        id: payload.id,
        name: payload.name,
        email: payload.email,
      },
      {
        secret: process.env.JWT_KEY,
        expiresIn: '15m',
      },
    );
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_KEY,
    });
  }
}
