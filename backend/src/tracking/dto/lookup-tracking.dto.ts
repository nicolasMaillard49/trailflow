import { IsOptional, IsString, MaxLength, IsEmail } from 'class-validator';

export class LookupTrackingDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  orderRef?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  orderNumber?: string;

  @IsEmail()
  email!: string;
}
