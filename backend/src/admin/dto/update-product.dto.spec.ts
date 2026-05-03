import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateProductDto } from './update-product.dto';

describe('UpdateProductDto', () => {
  it('should accept valid product data', async () => {
    const dto = plainToInstance(UpdateProductDto, {
      name: 'Mon Produit',
      price: 29.99,
      description: 'A magnetic bag',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject negative price', async () => {
    const dto = plainToInstance(UpdateProductDto, { price: -10 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('price');
  });

  it('should accept empty object (all optional)', async () => {
    const dto = plainToInstance(UpdateProductDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject non-string name', async () => {
    const dto = plainToInstance(UpdateProductDto, { name: 123 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('should accept valid images array', async () => {
    const dto = plainToInstance(UpdateProductDto, {
      images: ['/images/product/product-1.jpg', '/images/product/product-2.png'],
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject non-string items in images array', async () => {
    const dto = plainToInstance(UpdateProductDto, {
      images: [123, 456],
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject negative costPrice', async () => {
    const dto = plainToInstance(UpdateProductDto, { costPrice: -5 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('costPrice');
  });
});
