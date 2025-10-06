import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TenantDto } from './tenant.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';


export class CreateContractDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TenantDto)
  tenants: TenantDto[];

  @IsNumber()
  @IsNotEmpty() 
  @Type(() => Number)
  payment_cycle: number;

  @IsNumber()
  @IsNotEmpty() 
  @Type(() => Number)
  price_per_cycle: number;

  @IsNumber()
  @IsNotEmpty() 
  @Type(() => Number)
  electricity_type: number;

  @IsNumber()
  @IsNotEmpty() 
  @Type(() => Number)
  water_type: number;

  @IsNumber()
  @IsNotEmpty() 
  @Type(() => Number)
  electricity_price: number;

  @IsNumber()
  @IsNotEmpty() 
  @Type(() => Number)
  water_price: number;

  @IsNumber()
  @IsNotEmpty() 
  @Type(() => Number)
  electricity_start: number;

  @IsNumber()
  @IsNotEmpty() 
  @Type(() => Number)
  water_start: number;

  @IsNumber()
  @IsNotEmpty() 
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
  @IsNotEmpty() 
  @Type(() => Number)
  room_id: number;
}

export class UpdateContractDto extends PartialType(CreateContractDto){}

export class CreateContractWithImagesDto extends CreateContractDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  electricityImage?: string;

  @IsOptional()  
  @IsString()
  @ApiProperty({ required: false })
  waterImage?: string;
}


export class UpdateContractWithImagesDto extends PartialType(CreateContractWithImagesDto) {}