import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class CreateRoomApartmentDto {  
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
}

export class UpdateRoomApartmentDto extends PartialType(CreateRoomApartmentDto, ) {}