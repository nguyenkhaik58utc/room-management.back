import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class TenantDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  id_card: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  full_name: string;
}
