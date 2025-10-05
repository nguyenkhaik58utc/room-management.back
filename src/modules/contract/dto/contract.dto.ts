import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEmail, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TenantDto } from './tenant.dto';
import { PartialType } from '@nestjs/swagger';


export class CreateContractDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TenantDto)
  tenants: TenantDto[];

  @IsString()
  payment_cycle: string;

  @IsString()
  price_per_cycle: string;

  @IsString()
  electricity_type: string;

  @IsString()
  water_type: string;

  @IsString()
  electricity_price: string;

  @IsString()
  water_price: string;

  @IsNumber()
  @Type(() => Number)
  electricity_start: number;

  @IsNumber()
  @Type(() => Number)
  water_start: number;

  @IsNumber()
  @Type(() => Number)
  num_people: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsNumber()
  @Type(() => Number)
  room_id: number;
}

export class UpdateContractDto extends PartialType(CreateContractDto){}