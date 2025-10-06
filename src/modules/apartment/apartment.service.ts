import { S3Service } from './../s3/s3.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApartmentBaseDto, UpdateApartmentBaseDto } from './dto/apartment.dto';
import { Prisma } from 'generated/prisma';

@Injectable()
export class ApartmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async createApartment(createApartmentDto: ApartmentBaseDto) {
    try {
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
    } catch (error) {
      if (createApartmentDto.thumbnail) {
        await this.s3Service.deleteFile(
          process.env.AWS_S3_BUCKET!,
          createApartmentDto.thumbnail,
        );
      }
      if (
        createApartmentDto.galleries &&
        createApartmentDto.galleries.length > 0
      ) {
        for (const key of createApartmentDto.galleries) {
          await this.s3Service.deleteFile(process.env.AWS_S3_BUCKET!, key);
        }
      }
      throw new Error(`Create apartment failed: ${error.message}`);
    }
  }

  async updateApartment(
    id: number,
    updateApartmentDto: UpdateApartmentBaseDto,
  ) {
    try {
      const { province_id, district_id, ward_id, user_id, galleries, ...rest } =
        updateApartmentDto;

      const data: any = {
        ...rest,
        gallery: galleries,
        province: province_id
          ? { connect: { province_id: province_id } }
          : undefined,

        district: district_id
          ? { connect: { district_id: district_id } }
          : undefined,

        ward: ward_id ? { connect: { ward_id: ward_id } } : undefined,

        user: user_id ? { connect: { id: Number(user_id) } } : undefined,
      };

      return this.prisma.apartments.update({
        where: { id },
        data,
        include: {
          province: true,
          district: true,
          ward: true,
        },
      });
    } catch (error) {
      if (updateApartmentDto.thumbnail) {
        await this.s3Service.deleteFile(
          process.env.AWS_S3_BUCKET!,
          updateApartmentDto.thumbnail,
        );
      }
      if (
        updateApartmentDto.galleries &&
        updateApartmentDto.galleries.length > 0
      ) {
        for (const key of updateApartmentDto.galleries) {
          await this.s3Service.deleteFile(process.env.AWS_S3_BUCKET!, key);
        }
      }
      throw new Error(`Update apartment failed: ${error.message}`);
    }
  }
  async getApartments(
    page: number = 1,
    pageSize: number = Number(process.env.PAGE_SIZE ?? 10),
    search?: string,
  ) {
    const skip = (page - 1) * pageSize;
    const whereApartment = search
      ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.apartments.findMany({
        where: whereApartment,
        skip,
        take: Number(pageSize),
        include: {
          rooms: {
            include: { contracts: true },
          },
          province: true,
          district: true,
          ward: true,
        },
      }),
      this.prisma.apartments.count({ where: whereApartment }),
    ]);

    return {
      data: data.map((ap) => ({
        ...ap,
        totalRooms: ap.rooms.length,
        emptyRooms: ap.rooms.filter((r) => r.contracts.length === 0).length,
      })),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    };
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
