import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class RoomApartmentBaseDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  apartment_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(45)
  @ApiProperty({ example: 'P101' })
  room_num_bar: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  default_price: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: '' })
  max_tenant: number;

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

export class UpdateRoomApartmentBaseDto extends PartialType(RoomApartmentBaseDto) {}
export class CreateRoomApartmentDto extends PickType(RoomApartmentBaseDto, [
  'apartment_id',
  'room_num_bar',
  'default_price',
  'max_tenant'
] as const) {}
export class UpdateRoomApartmentDto extends PartialType(
  PickType(RoomApartmentBaseDto, [
    'apartment_id',
    'room_num_bar',
    'default_price',
    'max_tenant'
  ] as const),
) {}
