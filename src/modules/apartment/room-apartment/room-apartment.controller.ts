import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  ValidationPipe,
  UseGuards,
  UseInterceptors,
  UseFilters,
  UploadedFiles,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { RoomApartmentService } from './room-apartment.service';
import {
  CreateRoomApartmentDto,
  RoomApartmentBaseDto,
  UpdateRoomApartmentBaseDto,
  UpdateRoomApartmentDto,
} from './dto/room-apartment.dto';
import { TimeGuard } from 'src/common/guards/common.guards';
import { CommonInterceptor } from 'src/common/interceptors/common.interceptors';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { S3Service } from 'src/modules/s3/s3.service';
@Controller('api/room-apartments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token')
@UseGuards(TimeGuard)
@UseInterceptors(CommonInterceptor)
@UseFilters(HttpExceptionFilter)
export class RoomApartmentController {
  constructor(
    private readonly roomApartmentService: RoomApartmentService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @ApiBody({ type: CreateRoomApartmentDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnails', maxCount: 1 },
      { name: 'galleries', maxCount: 5 },
    ])
  )
  async create(
    @Body(new ValidationPipe({ transform: true })) createRoomApartmentDto: CreateRoomApartmentDto,
    @UploadedFiles()
    files: {
      thumbnails?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    },
  ) {
    const RoomApartmentDto: RoomApartmentBaseDto = {
      ...createRoomApartmentDto,
    };
    const urls: string[] = [];
    if (files.thumbnails) {
      for (const thumbnail of files?.thumbnails ?? []) {
        const resultThumbnail = await this.s3Service.uploadFile(
          thumbnail,
          process.env.AWS_S3_BUCKET!,
        );
        if (!resultThumbnail.url) {
          throw new Error('Failed to upload thumbnail');
        }
        RoomApartmentDto.thumbnail = resultThumbnail.url;
      }
    }
    if (files.galleries) {
      for (const gallery of files?.galleries ?? []) {
        const result = await this.s3Service.uploadFile(
          gallery,
          process.env.AWS_S3_BUCKET!,
        );
        if (!result.url) {
          throw new Error('Failed to upload gallery image');
        }
        urls.push(result.url);
      }
      RoomApartmentDto.galleries = urls;
    }
    return await this.roomApartmentService.createApartment(RoomApartmentDto);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  async findAllByID(@Param('id', ParseIntPipe) id: number) {
    return await this.roomApartmentService.getAllRoomApartmentById(id);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  async findByID(@Param('id', ParseIntPipe) id: number) {
    return await this.roomApartmentService.getRoomApartmentById(id);
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateRoomApartmentDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnails', maxCount: 1 },
      { name: 'galleries', maxCount: 5 },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) updateRoomApartmentDto: UpdateRoomApartmentDto,
    @UploadedFiles()
    files: {
      thumbnails?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    }
  ) {
    const RoomApartmentDto: UpdateRoomApartmentBaseDto = {
      ...updateRoomApartmentDto
    };
    const urls: string[] = [];
    if (files.thumbnails) {
      for (const thumbnail of files?.thumbnails ?? []) {
        const resultThumbnail = await this.s3Service.uploadFile(
          thumbnail,
          process.env.AWS_S3_BUCKET!,
        );
        if (!resultThumbnail.url) {
          throw new Error('Failed to upload thumbnail');
        }
        RoomApartmentDto.thumbnail = resultThumbnail.url;
      }
    }
    if (files.galleries) {
      for (const gallery of files?.galleries ?? []) {
        const result = await this.s3Service.uploadFile(
          gallery,
          process.env.AWS_S3_BUCKET!,
        );
        if (!result.url) {
          throw new Error('Failed to upload gallery image');
        }
        urls.push(result.url);
      }
      RoomApartmentDto.galleries = urls;
    }
    return await this.roomApartmentService.updateRoomApartment(
      id,
      updateRoomApartmentDto,
    );
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.roomApartmentService.deleteRoomApartment(id);
  }
}
