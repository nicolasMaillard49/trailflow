import { IsString, IsInt, Min, Max, IsOptional, IsEmail, ValidateNested, IsNotEmpty, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  line1: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class CreateCheckoutDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;

  @IsOptional()
  @IsString()
  bundleId?: string;

  @IsOptional()
  @IsString()
  sport?: string;

  /** Taille choisie (S, M, L, XL…). Stockée sur l'order item, utile au SAV
   * et à la prépa du colis fournisseur. */
  @IsOptional()
  @IsString()
  size?: string;

  /** Coloris choisi ("Gris perle", "Noir nuit", "Bleu pastel"). Idem. */
  @IsOptional()
  @IsString()
  color?: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;
}
