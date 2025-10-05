import { S3Service } from '../s3/s3.service';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';

@Injectable()
export class ContractService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async createContract(createContractDto: CreateContractDto) {
    try {
      return this.prisma.tenant_contracts.create({
        data: createContractDto
      });
    } catch (error) {
      throw new Error(`Create contract failed: ${error.message}`);
    }
  }

  async updateContract(
    id: number,
    updateContractDto: UpdateContractDto,
  ) {
    try {
      

      return this.prisma.tenant_contracts.update({
        where: { id },
        updateContractDto
      });
    } catch (error) {
      throw new Error(`Update contract failed: ${error.message}`);
    }
  }

  async getContracts() {
    return await this.prisma.tenant_contracts.findMany();
  }

  async getContractById(id: number) {
    return this.prisma.tenant_contracts.findUnique({
      where: { id },
    });
  }

  async deleteContract(id: number) {
    return this.prisma.$transaction(async () => {
      return await this.prisma.tenant_contracts.delete({ where: { id } });
    });
  }
}
