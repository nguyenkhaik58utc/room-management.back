import { MiddlewareConsumer, Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { TokenModule } from 'src/modules/token/token.module';
import { RoomApartmentService } from './room-apartment.service';
import { LoggerMiddleware, TimeLoggerMiddleware } from 'src/common/middleware/common.middleware';
import { AuthMiddleware } from 'src/modules/auth/middleware/auth.middleware';
import { RoomApartmentController } from './room-apartment.controller';

@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [RoomApartmentController],
  providers: [RoomApartmentService],
  exports: [RoomApartmentService]
})
export class RoomApartmentModule {
  configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(LoggerMiddleware, AuthMiddleware, TimeLoggerMiddleware)
        .forRoutes(RoomApartmentController);
    }
}
