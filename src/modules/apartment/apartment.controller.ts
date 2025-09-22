import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, ValidationPipe, UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { TimeGuard } from '../../common/guards/common.guards';
import { CommonInterceptor } from '../../common/interceptors/common.interceptors';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { ApartmentService } from './apartment.service';
import { CreateApartmentDto, UpdateApartmentDto } from './dto/apartment.dto';
@Controller('api/apartments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token')
@UseGuards(TimeGuard)
@UseInterceptors(CommonInterceptor)
@UseFilters(HttpExceptionFilter)
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Post()
  @ApiBody({ type: CreateApartmentDto })
  async create(@Body(new ValidationPipe()) createApartmentDto: CreateApartmentDto) {
    return await this.apartmentService.createApartment(createApartmentDto);
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
  async update(@Param('id', ParseIntPipe) id: number, @Body(new ValidationPipe()) updateApartmentDto: UpdateApartmentDto) {
    return await this.apartmentService.updateApartment(id, updateApartmentDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.apartmentService.deleteApartment(id);
  }
}
