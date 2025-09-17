import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, ValidationPipe, UseGuards, UseInterceptors, UseFilters } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TimeGuard } from 'src/common/guards/common.guards';
import { LoggingInterceptor } from 'src/common/interceptors/common.interceptors';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
@Controller('api/users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token')
@UseGuards(TimeGuard)
@UseInterceptors(LoggingInterceptor)
@UseFilters(HttpExceptionFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    return await this.userService.createUser(createUserDto);
  }

  @Get()
  async findAll() {
    return await this.userService.getUsers();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.getUserById(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body(new ValidationPipe()) updateUserDto: UpdateUserDto) {
    return await this.userService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.deleteUser(id);
  }
}
