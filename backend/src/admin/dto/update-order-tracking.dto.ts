import { IsString, IsOptional } from 'class-validator';

export class UpdateOrderTrackingDto {
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  trackingUrl?: string;
}
