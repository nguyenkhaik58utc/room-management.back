import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ApartmentModule } from './modules/apartment/apartment.module';
import { AddressModule } from './modules/address/address.module';
import { RoomApartmentModule } from './modules/apartment/room-apartment/room-apartment.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    AddressModule,
    ApartmentModule,
    RoomApartmentModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
