import { S3Service } from './../s3/s3.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApartmentBaseDto, UpdateApartmentBaseDto } from './dto/apartment.dto';

@Injectable()
export class ApartmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async createApartment(createApartmentDto: ApartmentBaseDto) {
    return this.prisma.apartments.create({
      data: {
        user_id: createApartmentDto.user_id,
        name: createApartmentDto.name,
        province_id: createApartmentDto.province_id,
        district_id: createApartmentDto.district_id,
        ward_id: createApartmentDto.ward_id,
        address: createApartmentDto.address,
        thumbnail: createApartmentDto.thumbnail,
        gallery: createApartmentDto.galleries || [],
      },
      include: {
        province: true,
        district: true,
        ward: true,
      },
    });
  }

  async updateApartment(
    id: number,
    updateApartmentDto: UpdateApartmentBaseDto,
  ) {
    const data: any = { ...updateApartmentDto };
    return this.prisma.apartments.update({
      where: { id },
      data,
      include: {
        province: true,
        district: true,
        ward: true,
      },
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
    return this.prisma.$transaction(async () => {
      const apartment = await this.prisma.apartments.delete({ where: { id } });
      try {
        if (apartment.thumbnail) {
          await this.s3Service.deleteFile(
            process.env.AWS_S3_BUCKET!,
            apartment.thumbnail,
          );
        }
        if (apartment.gallery && apartment.gallery.length > 0) {
          for (const key of apartment.gallery) {
            await this.s3Service.deleteFile(process.env.AWS_S3_BUCKET!, key);
          }
        }
      } catch (err) {
        throw new Error(`Delete S3 failed: ${err.message}`);
      }

      return apartment;
    });
  }
}
