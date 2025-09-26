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
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { TimeGuard } from '../../common/guards/common.guards';
import { CommonInterceptor } from '../../common/interceptors/common.interceptors';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { ApartmentService } from './apartment.service';
import {
  ApartmentBaseDto,
  CreateApartmentDto,
  UpdateApartmentBaseDto,
  UpdateApartmentDto,
} from './dto/apartment.dto';
import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { S3Service } from '../s3/s3.service';
@Controller('api/apartments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token')
@UseGuards(TimeGuard)
@UseInterceptors(CommonInterceptor)
@UseFilters(HttpExceptionFilter)
export class ApartmentController {
  constructor(
    private readonly apartmentService: ApartmentService,
    private readonly s3Service: S3Service,
  ) {}

  @Post()
  @ApiBody({ type: CreateApartmentDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnails', maxCount: 1 },
      { name: 'galleries', maxCount: 5 },
    ]),
  )
  async create(
    @Body(new ValidationPipe()) createApartmentDto: CreateApartmentDto,
    @UploadedFiles()
    files: {
      thumbnails?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    },
    @Req() req: any,
  ) {
    
    const user = req['user'];
    const ApartmentDto: ApartmentBaseDto = {
      ...createApartmentDto,
      user_id: user.id,
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
        ApartmentDto.thumbnail = resultThumbnail.url;
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
      ApartmentDto.galleries = urls;
    }
    return await this.apartmentService.createApartment(ApartmentDto);
  }

  @Get()
  async findAll() {
    return await this.apartmentService.getApartments();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.apartmentService.getApartmentById(id);
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateApartmentDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnails', maxCount: 1 },
      { name: 'galleries', maxCount: 5 },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateApartmentDto: UpdateApartmentDto,
    @UploadedFiles()
    files: {
      thumbnails?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    },
    @Req() req: any,
  ) {
    const user = req['user'];
    const ApartmentDto: UpdateApartmentBaseDto = {
      ...updateApartmentDto,
      user_id: user.id,
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
        ApartmentDto.thumbnail = resultThumbnail.url;
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
      ApartmentDto.galleries = urls;
    }
    return await this.apartmentService.updateApartment(id, ApartmentDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.apartmentService.deleteApartment(id);
  }
}
