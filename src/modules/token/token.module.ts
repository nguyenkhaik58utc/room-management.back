import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_KEY ?? 'secret_key',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [TokenService],
  exports: [TokenService, JwtModule],
})
export class TokenModule {}
