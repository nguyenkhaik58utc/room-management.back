import { S3Service } from './../../s3/s3.service';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  RoomApartmentBaseDto,
  UpdateRoomApartmentBaseDto,
} from './dto/room-apartment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoomApartmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async createApartment(createRoomApartmentDto: RoomApartmentBaseDto) {
    try {
      const roomExists = await this.prisma.apartment_rooms.findFirst({
        where: {
          apartment_id: createRoomApartmentDto.apartment_id,
          room_num_bar: createRoomApartmentDto.room_num_bar,
        },
      });
      if (roomExists) {
        throw new ConflictException(
          'Room number already exists in this apartment',
        );
      }
      return this.prisma.apartment_rooms.create({
        data: {
          apartment_id: createRoomApartmentDto.apartment_id,
          room_num_bar: createRoomApartmentDto.room_num_bar,
          default_price: createRoomApartmentDto.default_price,
          max_tenant: createRoomApartmentDto.max_tenant,
          thumbnail: createRoomApartmentDto.thumbnail,
          gallery: createRoomApartmentDto.galleries,
        },
      });
    } catch (error) {
      await this.s3Service.deleteFile(
        process.env.AWS_S3_BUCKET!,
        createRoomApartmentDto.thumbnail!,
      );
      for (const gallery of createRoomApartmentDto.galleries || []) {
        await this.s3Service.deleteFile(process.env.AWS_S3_BUCKET!, gallery);
      }
      throw new InternalServerErrorException(
        `Create apartment failed: ${error.message}`,
      );
    }
  }

  async updateRoomApartment(
    id: number,
    updateRoomApartmentDto: UpdateRoomApartmentBaseDto,
  ) {
    try {
      const duplicateRoom = await this.prisma.apartment_rooms.findFirst({
        where: {
          id: { not: id },
          apartment_id: updateRoomApartmentDto.apartment_id,
          room_num_bar: updateRoomApartmentDto.room_num_bar,
        },
      });

      if (duplicateRoom) {
        throw new ConflictException(
          'Room number already exists in this apartment',
        );
      }
      const roomExists = await this.prisma.apartment_rooms.findUnique({
        where: { id },
        select: {
          thumbnail: true,
          gallery: true,
        },
      });

      const thumbnailOld = roomExists?.thumbnail;
      const galleriesOld = roomExists?.gallery || [];

      const data: any = { ...updateRoomApartmentDto };
      console.log('Data to update:', data);
      const result = await this.prisma.apartment_rooms.update({
        where: { id },
        data: {
          apartment_id: data.apartment_id,
          room_num_bar: data.room_num_bar,
          default_price: data.default_price,
          max_tenant: data.max_tenant,
          thumbnail: data.thumbnail,
          gallery: data.galleries,
        },
      });
      if (thumbnailOld && thumbnailOld !== updateRoomApartmentDto.thumbnail) {
        await this.s3Service.deleteFile(
          process.env.AWS_S3_BUCKET!,
          thumbnailOld,
        );
      }
      if (galleriesOld && updateRoomApartmentDto.galleries) {
        const galleriesToDelete = galleriesOld.filter(
          (gallery) => !updateRoomApartmentDto.galleries!.includes(gallery),
        );
        for (const gallery of galleriesToDelete) {
          await this.s3Service.deleteFile(process.env.AWS_S3_BUCKET!, gallery);
        }
      }
      return result;
    } catch (error) {
      if (updateRoomApartmentDto.thumbnail) {
        await this.s3Service.deleteFile(
          process.env.AWS_S3_BUCKET!,
          updateRoomApartmentDto.thumbnail,
        );
      }
      for (const gallery of updateRoomApartmentDto.galleries || []) {
        await this.s3Service.deleteFile(process.env.AWS_S3_BUCKET!, gallery);
      }
      throw new InternalServerErrorException(
        `Update apartment failed: ${error.message}`,
      );
    }
  }

  async getAllRoomApartmentById(
    id: number,
    page: number = 1,
    pageSize: number = Number(process.env.PAGE_SIZE ?? 10),
    search?: string,
  ) {
    const skip = (page - 1) * pageSize;
        const whereRoom = search
          ? { room_num_bar: { contains: search, mode: Prisma.QueryMode.insensitive } }
          : {};
    
    const [data, total] = await this.prisma.$transaction([
      this.prisma.apartment_rooms.findMany({
        where: whereRoom,
        skip,
        take: Number(pageSize)
      }),
      this.prisma.apartment_rooms.count({ where : whereRoom }),
    ]);

    return {
      data: data.map((ap) => ({
        ...ap
      })),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    };
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
