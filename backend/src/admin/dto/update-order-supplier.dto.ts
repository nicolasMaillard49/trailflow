import { IsString, IsOptional } from 'class-validator';

export class UpdateOrderSupplierDto {
  @IsOptional()
  @IsString()
  supplierOrderId?: string;

  @IsOptional()
  @IsString()
  supplierUrl?: string;
}
