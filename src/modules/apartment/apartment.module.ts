import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggerMiddleware, TimeLoggerMiddleware } from '../../common/middleware/common.middleware';
import { AuthMiddleware } from '../auth/middleware/auth.middleware';
import { TokenModule } from '../token/token.module';
import { ApartmentController } from './apartment.controller';
import { ApartmentService } from './apartment.service';
import { S3Service } from '../s3/s3.service';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [ApartmentController],
  providers: [ApartmentService, S3Service],
  exports: [ApartmentService]
})
export class ApartmentModule {
  configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(LoggerMiddleware, AuthMiddleware, TimeLoggerMiddleware)
        .forRoutes(ApartmentController);
    }
}
