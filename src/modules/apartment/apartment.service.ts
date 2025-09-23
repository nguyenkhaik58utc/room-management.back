import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';

@Injectable()
export class ApartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async createApartment(createApartmentDto: CreateApartmentDto) {
    return this.prisma.apartments.create({
      data: {
        user_id: 17,
        name: createApartmentDto.name,
        province_id: createApartmentDto.province_id,
        district_id: createApartmentDto.district_id,
        ward_id: createApartmentDto.ward_id,
        address: createApartmentDto.address,
      },
      include: {
        province: true,
        district: true,
        ward: true,
      },
    });
  }

  async updateApartment(id: number, updateApartmentDto: UpdateApartmentDto) {
    const data: any = { ...updateApartmentDto };
    return this.prisma.apartments.update({
      where: { id },
      data,
    });
  }

  async getApartments() {
    const apartments = this.prisma.apartments.findMany({
      include: {
        rooms: {
          include: {
            contracts: true,
          },
        },
        province: true,
        district: true,
        ward: true,
      },
    });

    return (await apartments).map((ap) => {
      const totalRooms = ap.rooms.length;
      const emptyRooms = ap.rooms.filter(
        (r) => r.contracts.length === 0,
      ).length;

      return {
        ...ap,
        totalRooms,
        emptyRooms,
      };
    });
  }

  async getApartmentById(id: number) {
    return this.prisma.apartments.findUnique({
      where: { id },
    });
  }

  async deleteApartment(id: number) {
    return this.prisma.apartments.delete({ where: { id } });
  }
}
