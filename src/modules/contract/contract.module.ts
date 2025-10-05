import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerMiddleware, TimeLoggerMiddleware } from '../../common/middleware/common.middleware';
import { AuthMiddleware } from '../auth/middleware/auth.middleware';
import { TokenModule } from '../token/token.module';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';
import { S3Service } from '../s3/s3.service';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [ContractController],
  providers: [ContractService, S3Service],
  exports: [ContractService]
})
export class ContractModule {
  configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(LoggerMiddleware, AuthMiddleware, TimeLoggerMiddleware)
        .forRoutes(ContractController);
    }
}
