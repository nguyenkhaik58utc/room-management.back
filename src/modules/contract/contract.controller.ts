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
  Req
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { TimeGuard } from '../../common/guards/common.guards';
import { CommonInterceptor } from '../../common/interceptors/common.interceptors';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { ContractService } from './contract.service';
import {
  CreateContractDto,
  CreateContractWithImagesDto,
  UpdateContractDto,
  UpdateContractWithImagesDto
} from './dto/contract.dto';
import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { S3Service } from '../s3/s3.service';
@Controller('api/contracts')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token')
@UseGuards(TimeGuard)
@UseInterceptors(CommonInterceptor)
@UseFilters(HttpExceptionFilter)
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private readonly s3Service: S3Service,
  ) { }

  @Post()
  @ApiBody({ type: CreateContractDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'electricityImages' },
      { name: 'waterImages' },
    ]),
  )
  async create(
    @UploadedFiles()
    files: {
      electricityImages?: Express.Multer.File[];
      waterImages?: Express.Multer.File[];
    },
    @Req() req: any
  ) {
    const body = req.body;

    const createContractDto: CreateContractDto = {
      tenants: JSON.parse(body.tenants),
      payment_cycle: Number(body.payment_cycle),
      price_per_cycle: Number(body.price_per_cycle),
      electricity_type: Number(body.electricity_type),
      water_type: Number(body.water_type),
      electricity_price: Number(body.electricity_price),
      water_price: Number(body.water_price),
      electricity_start: Number(body.electricity_start),
      water_start: Number(body.water_start),
      num_people: Number(body.num_people),
      note: body.note,
      start_date: body.start_date,
      end_date: body.end_date,
      room_id: Number(body.room_id),
    };

    console.log('BODY:', createContractDto);
    console.log('FILES:', files);

    const contract: CreateContractWithImagesDto = { ...createContractDto };
    if (files.electricityImages) {
      for (const electricityImage of files?.electricityImages ?? []) {
        const result = await this.s3Service.uploadFile(
          electricityImage,
          process.env.AWS_S3_BUCKET!,
        );
        if (!result.url) {
          throw new Error('Failed to upload electricityImage');
        }
        contract.electricityImage = result.url;
      }
    }
    if (files.waterImages) {
      for (const waterImage of files?.waterImages ?? []) {
        const result = await this.s3Service.uploadFile(
          waterImage,
          process.env.AWS_S3_BUCKET!,
        );
        if (!result.url) {
          throw new Error('Failed to upload waterImage');
        }
        contract.waterImage = result.url;
      }
    }
    return await this.contractService.createContract(contract);
  }

  @Get()
  async findAll() {
    return await this.contractService.getContracts();
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.contractService.getContractById(id);
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateContractDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'electricityImage' },
      { name: 'waterImage' },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateContractDto: UpdateContractDto,
    @UploadedFiles()
    files: {
      electricityImages?: Express.Multer.File[];
      waterImages?: Express.Multer.File[];
    }
  ) {
    const contract: UpdateContractWithImagesDto = { ...updateContractDto };
    if (files.electricityImages) {
      for (const electricityImage of files?.electricityImages ?? []) {
        const result = await this.s3Service.uploadFile(
          electricityImage,
          process.env.AWS_S3_BUCKET!,
        );
        if (!result.url) {
          throw new Error('Failed to upload electricityImage');
        }
        contract.electricityImage = result.url;
      }
    }
    if (files.waterImages) {
      for (const waterImage of files?.waterImages ?? []) {
        const result = await this.s3Service.uploadFile(
          waterImage,
          process.env.AWS_S3_BUCKET!,
        );
        if (!result.url) {
          throw new Error('Failed to upload waterImage');
        }
        contract.waterImage = result.url;
      }
    }
    return await this.contractService.updateContract(id, updateContractDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.contractService.deleteContract(id);
  }
}
