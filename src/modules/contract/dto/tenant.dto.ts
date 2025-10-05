import { IsString, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TenantDto {
  @IsString()
  phone: string;

  @IsString()
  id_card: string;

  @IsEmail()
  email: string;

  @IsString()
  full_name: string;
}
