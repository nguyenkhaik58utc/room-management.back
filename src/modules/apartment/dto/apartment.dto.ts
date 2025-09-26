import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ApartmentBaseDto {
  user_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  @ApiProperty({ example: '' })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @ApiProperty({ example: '' })
  province_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @ApiProperty({ example: '' })
  district_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @ApiProperty({ example: '' })
  ward_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  @ApiProperty({ example: '' })
  address: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  thumbnail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false, type: [String] })
  galleries?: string[];
}

export class UpdateApartmentBaseDto extends PartialType(ApartmentBaseDto) {}
export class CreateApartmentDto extends PickType(ApartmentBaseDto, [
  'name',
  'province_id',
  'district_id',
  'ward_id',
  'address',
] as const) {}
export class UpdateApartmentDto extends PartialType(
  PickType(ApartmentBaseDto, [
    'name',
    'province_id',
    'district_id',
    'ward_id',
    'address',
  ] as const),
) {}
