import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, IsNumber } from 'class-validator';

export class CreateApartmentDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: '1' })
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

}

export class UpdateApartmentDto extends PartialType(CreateApartmentDto, ) {}