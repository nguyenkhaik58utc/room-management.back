import { S3Service } from '../s3/s3.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateContractWithImagesDto,
  UpdateContractWithImagesDto,
} from './dto/contract.dto';

@Injectable()
export class ContractService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async createContract(createContractDto: CreateContractWithImagesDto) {
    return this.prisma.$transaction(async () => {
      try {
        const activeContract = await this.prisma.contracts.findFirst({
          where: {
            apartment_room_id: createContractDto.room_id,
            status: 'active',
            end_date: { gt: new Date() },
          },
        });

        if (activeContract) {
          throw new BadRequestException('Contract exists.');
        }
        const newContract = await this.prisma.contracts.create({
          data: {
            apartment_room_id: createContractDto.room_id,
            pay_period: createContractDto.payment_cycle,
            price: BigInt(createContractDto.price_per_cycle),
            electricity_pay_type: createContractDto.electricity_type,
            electricity_price: BigInt(createContractDto.electricity_price),
            electricity_number_start: createContractDto.electricity_start,
            water_pay_type: createContractDto.water_type,
            water_price: BigInt(createContractDto.water_price),
            water_number_start: createContractDto.water_start,
            num_of_tenant_current: createContractDto.num_people,
            note: createContractDto.note,
            start_date: new Date(createContractDto.start_date),
            end_date: new Date(createContractDto.end_date),
            electricityImage: createContractDto.electricityImage || null,
            waterImage: createContractDto.waterImage || null,
            tenants: {
              create: createContractDto.tenants.map((t) => ({
                tenant: {
                  connectOrCreate: {
                    where: { email: t.email },
                    create: {
                      name: t.full_name,
                      tel: t.phone,
                      identity_card_number: t.id_card,
                      email: t.email,
                    },
                  },
                },
              })),
            },
          },
          include: {
            tenants: {
              include: { tenant: true },
            },
          },
        });

        return newContract;
      } catch (error) {
        throw new Error(`Create contract failed: ${error.message}`);
      }
    });
  }

  async updateContract(
    id: number,
    updateContractDto: UpdateContractWithImagesDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.contracts.update({
        where: { id },
        data: {
          ...(updateContractDto.room_id !== undefined && {
            apartment_room_id: updateContractDto.room_id,
          }),
          ...(updateContractDto.payment_cycle !== undefined && {
            pay_period: updateContractDto.payment_cycle,
          }),
          ...(updateContractDto.price_per_cycle !== undefined && {
            price: BigInt(updateContractDto.price_per_cycle),
          }),
          ...(updateContractDto.electricity_type !== undefined && {
            electricity_pay_type: updateContractDto.electricity_type,
          }),
          ...(updateContractDto.electricity_price !== undefined && {
            electricity_price: BigInt(updateContractDto.electricity_price),
          }),
          ...(updateContractDto.electricity_start !== undefined && {
            electricity_number_start: updateContractDto.electricity_start,
          }),
          ...(updateContractDto.water_type !== undefined && {
            water_pay_type: updateContractDto.water_type,
          }),
          ...(updateContractDto.water_price !== undefined && {
            water_price: BigInt(updateContractDto.water_price),
          }),
          ...(updateContractDto.water_start !== undefined && {
            water_number_start: updateContractDto.water_start,
          }),
          ...(updateContractDto.num_people !== undefined && {
            num_of_tenant_current: updateContractDto.num_people,
          }),
          ...(updateContractDto.note !== undefined && {
            note: updateContractDto.note,
          }),
          ...(updateContractDto.start_date !== undefined && {
            start_date: new Date(updateContractDto.start_date),
          }),
          ...(updateContractDto.end_date !== undefined && {
            end_date: new Date(updateContractDto.end_date),
          }),
          ...(updateContractDto.electricityImage !== undefined && {
            electricityImage: updateContractDto.electricityImage,
          }),
          ...(updateContractDto.waterImage !== undefined && {
            waterImage: updateContractDto.waterImage,
          }),
        },
      });

      const existingTenants = await tx.contract_tenants.findMany({
        where: { contract_id: id },
        include: { tenant: true },
      });

      const existingEmails = existingTenants.map((t) => t.tenant.email);
      const newEmails = updateContractDto?.tenants?.map((t) => t.email) ?? [];

      const tenantsToRemove = existingTenants.filter(
        (t) => !newEmails.includes(t.tenant.email),
      );
      for (const t of tenantsToRemove) {
        await tx.contract_tenants.delete({
          where: { id: t.id },
        });
      }

      for (const tenantDto of updateContractDto.tenants ?? []) {
        const exists = existingEmails.includes(tenantDto.email);
        if (!exists) {
          const tenant = await tx.tenants.upsert({
            where: { email: tenantDto.email },
            update: {},
            create: {
              name: tenantDto.full_name,
              tel: tenantDto.phone,
              identity_card_number: tenantDto.id_card,
              email: tenantDto.email,
            },
          });

          await tx.contract_tenants.create({
            data: {
              contract_id: id,
              tenant_id: tenant.id,
            },
          });
        }
      }

      return tx.contracts.findUnique({
        where: { id },
        include: {
          tenants: {
            include: { tenant: true },
          },
        },
      });
    });
  }

  async getContracts() {
    return await this.prisma.contracts.findMany();
  }

  async getContractById(id: number) {
    return this.prisma.contracts.findUnique({
      where: { id },
    });
  }

  async deleteContract(id: number) {
    return this.prisma.$transaction(async () => {
      return await this.prisma.contracts.delete({ where: { id } });
    });
  }
}
