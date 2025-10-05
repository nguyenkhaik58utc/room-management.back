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
import { ContractService } from './contract.service';
import {
  ContractDto,
  UpdateContractDto
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
  ) {}

  @Post()
  @ApiBody({ type: ContractDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnails', maxCount: 1 },
      { name: 'galleries', maxCount: 5 },
    ]),
  )
  async create(
    @Body(new ValidationPipe()) createContractDto: ContractDto,
    @UploadedFiles()
    files: {
      thumbnails?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    },
    @Req() req: any,
  ) {
    
    const user = req['user'];
    
    return await this.contractService.createContract(createContractDto);
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
      { name: 'thumbnails', maxCount: 1 },
      { name: 'galleries', maxCount: 5 },
    ]),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateContractDto: UpdateContractDto,
    @UploadedFiles()
    files: {
      thumbnails?: Express.Multer.File[];
      galleries?: Express.Multer.File[];
    },
    @Req() req: any,
  ) {
    const user = req['user'];
    return await this.contractService.updateContract(id, updateContractDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.contractService.deleteContract(id);
  }
}
