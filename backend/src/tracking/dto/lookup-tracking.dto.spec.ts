import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LookupTrackingDto } from './lookup-tracking.dto';

describe('LookupTrackingDto', () => {
  it('should accept a valid orderNumber', async () => {
    const dto = plainToInstance(LookupTrackingDto, {
      orderNumber: '12345',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept valid name + email', async () => {
    const dto = plainToInstance(LookupTrackingDto, {
      name: 'John Doe',
      email: 'john@example.com',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept all fields empty (all optional)', async () => {
    const dto = plainToInstance(LookupTrackingDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject an invalid email', async () => {
    const dto = plainToInstance(LookupTrackingDto, {
      email: 'not-an-email',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should reject an orderNumber that is too long', async () => {
    const dto = plainToInstance(LookupTrackingDto, {
      orderNumber: 'x'.repeat(101),
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('orderNumber');
  });
});
