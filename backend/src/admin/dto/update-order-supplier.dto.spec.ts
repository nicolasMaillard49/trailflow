import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateOrderSupplierDto } from './update-order-supplier.dto';

describe('UpdateOrderSupplierDto', () => {
  it('should accept valid supplier data', async () => {
    const dto = plainToInstance(UpdateOrderSupplierDto, {
      supplierOrderId: '82156372849',
      supplierUrl: 'https://aliexpress.com/order/82156372849',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept empty optional fields', async () => {
    const dto = plainToInstance(UpdateOrderSupplierDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept only supplierOrderId without URL', async () => {
    const dto = plainToInstance(UpdateOrderSupplierDto, {
      supplierOrderId: '12345',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject non-string supplierOrderId', async () => {
    const dto = plainToInstance(UpdateOrderSupplierDto, {
      supplierOrderId: 12345,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('supplierOrderId');
  });
});
