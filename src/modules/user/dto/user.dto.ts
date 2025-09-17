import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({ example: '' })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ example: '' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(1024)
  @ApiProperty({ example: '' })
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto, ) {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
export class LoginUserDto extends PickType(CreateUserDto, ['email', 'password'] as const) {}