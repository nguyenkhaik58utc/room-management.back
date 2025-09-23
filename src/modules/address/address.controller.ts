import { Controller, Get, Param, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { AddressService } from './address.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TimeGuard } from 'src/common/guards/common.guards';
import { CommonInterceptor } from 'src/common/interceptors/common.interceptors';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';

@Controller('api/address')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('access-token')
@UseGuards(TimeGuard)
@UseInterceptors(CommonInterceptor)
@UseFilters(HttpExceptionFilter)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('provinces')
  getAllProvince() {
    return this.addressService.getAllProvince();
  }

  @Get('provinces/:id')
  getCityById(@Param('id') id: string) {
    return this.addressService.getProvinceById(id);
  }

  @Get('districts')
  getAllDistrict() {
    return this.addressService.getAllDistrict();
  }

  @Get('districts/:id')
  getDistrictById(@Param('id') id: string) {
    return this.addressService.getDistrictByProvinceId(id);
  }

  @Get('wards')
  getAllWard() {
    return this.addressService.getAllWard();
  }

  @Get('wards/:id')
  getWardById(@Param('id') id: string) {
    return this.addressService.getWardById(+id);
  }

  @Get('wards/by-district/:districtId')
  getWardByDistrict(@Param('districtId') districtId: string) {
    return this.addressService.getWardByDistrict(districtId);
  }
}
