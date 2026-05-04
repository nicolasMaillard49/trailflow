import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LookupTrackingDto } from './lookup-tracking.dto';

describe('LookupTrackingDto', () => {
  it('should accept a valid orderNumber + email', async () => {
    const dto = plainToInstance(LookupTrackingDto, {
      orderNumber: '12345',
      email: 'john@example.com',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept a valid orderRef + email', async () => {
    const dto = plainToInstance(LookupTrackingDto, {
      orderRef: 'TF-A1B2-C3D4',
      email: 'john@example.com',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject when email is missing', async () => {
    const dto = plainToInstance(LookupTrackingDto, {
      orderNumber: '12345',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should reject an invalid email', async () => {
    const dto = plainToInstance(LookupTrackingDto, {
      email: 'not-an-email',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('should reject an orderNumber that is too long', async () => {
    const dto = plainToInstance(LookupTrackingDto, {
      orderNumber: 'x'.repeat(101),
      email: 'john@example.com',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('orderNumber');
  });
});
