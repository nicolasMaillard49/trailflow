import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCheckoutDto } from './create-checkout.dto';

const validBase = {
  productId: 'prod-1',
  quantity: 1,
  customerName: 'Jean Dupont',
  customerEmail: 'jean@test.com',
  shippingAddress: {
    line1: '12 rue de la Paix',
    city: 'Paris',
    postalCode: '75001',
  },
};

function toDto(plain: Record<string, unknown>): CreateCheckoutDto {
  return plainToInstance(CreateCheckoutDto, plain);
}

describe('CreateCheckoutDto', () => {
  it('should pass with all required fields', async () => {
    const dto = toDto(validBase);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when productId is missing', async () => {
    const { productId, ...rest } = validBase;
    const dto = toDto(rest);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'productId')).toBe(true);
  });

  it('should fail when quantity is less than 1', async () => {
    const dto = toDto({ ...validBase, quantity: 0 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'quantity')).toBe(true);
  });

  it('should fail when quantity exceeds 10', async () => {
    const dto = toDto({ ...validBase, quantity: 11 });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'quantity')).toBe(true);
  });

  it('should pass with valid bundleId', async () => {
    const dto = toDto({ ...validBase, bundleId: '550e8400-e29b-41d4-a716-446655440000' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass without bundleId (optional)', async () => {
    const dto = toDto({ ...validBase, quantity: 3 });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should pass with optional sport field', async () => {
    const dto = toDto({ ...validBase, sport: 'football' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  // Customer fields validation
  it('should fail when customerName is missing', async () => {
    const { customerName, ...rest } = validBase;
    const dto = toDto(rest);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'customerName')).toBe(true);
  });

  it('should fail when customerEmail is invalid', async () => {
    const dto = toDto({ ...validBase, customerEmail: 'not-an-email' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'customerEmail')).toBe(true);
  });

  it('should fail when customerEmail is missing', async () => {
    const { customerEmail, ...rest } = validBase;
    const dto = toDto(rest);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'customerEmail')).toBe(true);
  });

  it('should pass with optional customerPhone', async () => {
    const dto = toDto({ ...validBase, customerPhone: '+33612345678' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail when shippingAddress is missing', async () => {
    const { shippingAddress, ...rest } = validBase;
    const dto = toDto(rest);
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'shippingAddress')).toBe(true);
  });

  it('should fail when shippingAddress.line1 is empty', async () => {
    const dto = toDto({
      ...validBase,
      shippingAddress: { line1: '', city: 'Paris', postalCode: '75001' },
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail when shippingAddress.city is missing', async () => {
    const dto = toDto({
      ...validBase,
      shippingAddress: { line1: '12 rue Test', postalCode: '75001' },
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass with optional shippingAddress.line2', async () => {
    const dto = toDto({
      ...validBase,
      shippingAddress: { line1: '12 rue Test', line2: 'Apt 3', city: 'Paris', postalCode: '75001' },
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
