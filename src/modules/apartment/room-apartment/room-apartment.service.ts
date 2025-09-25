import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateRoomApartmentDto, UpdateRoomApartmentDto } from './dto/room-apartment.dto';

@Injectable()
export class RoomApartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async createApartment(createRoomApartmentDto: CreateRoomApartmentDto) {
    const roomExists = await this.prisma.apartment_rooms.findFirst({
      where: {
        apartment_id: createRoomApartmentDto.apartment_id,
        room_num_bar: createRoomApartmentDto.room_num_bar,
      },
    });
    if (roomExists) {
      throw new ConflictException('Room number already exists in this apartment');
    }
    return this.prisma.apartment_rooms.create({
      data: {
        apartment_id: createRoomApartmentDto.apartment_id,
        room_num_bar: createRoomApartmentDto.room_num_bar,
        default_price: createRoomApartmentDto.default_price,
        max_tenant: createRoomApartmentDto.max_tenant
      }
    });
  }

  async updateRoomApartment(id: number, updateRoomApartmentDto: UpdateRoomApartmentDto) {
    const roomExists = await this.prisma.apartment_rooms.findFirst({
      where: {
        id: { not: id },
        apartment_id: updateRoomApartmentDto.apartment_id,
        room_num_bar: updateRoomApartmentDto.room_num_bar,
      },
    });
    if (roomExists) {
      throw new ConflictException('Room number already exists in this apartment');
    }

    const data: any = { ...updateRoomApartmentDto };
    return this.prisma.apartment_rooms.update({
      where: { id },
      data : {
        apartment_id: data.apartment_id,
        room_num_bar: data.room_num_bar,
        default_price: data.default_price,
        max_tenant: data.max_tenant
      }
    });
  }

  async getAllRoomApartmentById(id: number) {
    return this.prisma.apartment_rooms.findMany({where: {apartment_id: id}});
  }

  async getRoomApartmentById(id: number) {
    return this.prisma.apartment_rooms.findUnique({
      where: { id },
    });
  }

  async deleteRoomApartment(id: number) {
    return this.prisma.apartment_rooms.delete({ where: { id } });
  }
}
