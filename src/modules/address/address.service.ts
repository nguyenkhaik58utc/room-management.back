import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(private readonly prisma: PrismaService) {}

  getAllProvince() {
    return this.prisma.provinces.findMany();}

  getProvinceById(id: string) {
    return this.prisma.provinces.findUnique({ where: { province_id: id } });
  }

  getAllDistrict() {
    return this.prisma.districts.findMany();
  }

  getDistrictByProvinceId(id: string) {
    return this.prisma.districts.findMany({ where: { province_id: id } });
  }

  getAllWard() {
    return this.prisma.wards.findMany();
  }

  getWardById(id: number) {
    return this.prisma.wards.findUnique({ where: { id: id } });
  }

  getWardByDistrict(id: string) {
    return this.prisma.wards.findMany({ where: { district_id: id } });
  }
}
