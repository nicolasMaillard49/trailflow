import { IsOptional, IsString, MaxLength, IsEmail } from 'class-validator';

export class LookupTrackingDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  orderNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
