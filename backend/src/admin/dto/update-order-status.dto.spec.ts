import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateOrderStatusDto } from './update-order-status.dto';

describe('UpdateOrderStatusDto', () => {
  it('should accept valid status PAID', async () => {
    const dto = plainToInstance(UpdateOrderStatusDto, { status: 'PAID' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept valid status SHIPPED', async () => {
    const dto = plainToInstance(UpdateOrderStatusDto, { status: 'SHIPPED' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject invalid status "UNKNOWN"', async () => {
    const dto = plainToInstance(UpdateOrderStatusDto, { status: 'UNKNOWN' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('should reject empty string', async () => {
    const dto = plainToInstance(UpdateOrderStatusDto, { status: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject numeric value', async () => {
    const dto = plainToInstance(UpdateOrderStatusDto, { status: 123 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
