import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, ValidationPipe, UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { RoomApartmentService } from './room-apartment.service';
import { CreateRoomApartmentDto, UpdateRoomApartmentDto } from './dto/room-apartment.dto';
import { TimeGuard } from 'src/common/guards/common.guards';
import { CommonInterceptor } from 'src/common/interceptors/common.interceptors';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
@Controller('api/room-apartments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token')
@UseGuards(TimeGuard)
@UseInterceptors(CommonInterceptor)
@UseFilters(HttpExceptionFilter)
export class RoomApartmentController {
  constructor(private readonly roomApartmentService: RoomApartmentService) {}

  @Post()
  @ApiBody({ type: CreateRoomApartmentDto })
  async create(@Body(new ValidationPipe()) createRoomApartmentDto: CreateRoomApartmentDto) {
    return await this.roomApartmentService.createApartment(createRoomApartmentDto);
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
  async update(@Param('id', ParseIntPipe) id: number, @Body(new ValidationPipe()) updateRoomApartmentDto: UpdateRoomApartmentDto) {
    return await this.roomApartmentService.updateRoomApartment(id, updateRoomApartmentDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.roomApartmentService.deleteRoomApartment(id);
  }
}
