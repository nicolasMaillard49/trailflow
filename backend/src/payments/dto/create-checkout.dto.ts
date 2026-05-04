import { IsString, IsInt, Min, Max, IsOptional, IsEmail, ValidateNested, IsNotEmpty, IsDefined, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';
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

export class CheckoutItemDto {
  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(10)
  quantity: number;

  /** Taille choisie (S, M, L, XL…). Vide pour les add-ons sans taille. */
  @IsOptional()
  @IsString()
  size?: string;

  /** Coloris choisi. Vide pour les add-ons sans coloris. */
  @IsOptional()
  @IsString()
  color?: string;
}

export class CreateCheckoutDto {
  // --- Multi-items (utilisé par /checkout depuis le panier multi-lignes) ---
  // Si fourni et non vide, prime sur productId/quantity/size/color au top-level.
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items?: CheckoutItemDto[];

  // --- Solo (rétrocompat tests + bundles) ---
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  quantity?: number;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;

  // --- Bundle ---
  @IsOptional()
  @IsString()
  bundleId?: string;

  @IsOptional()
  @IsString()
  sport?: string;

  // --- Customer ---
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
