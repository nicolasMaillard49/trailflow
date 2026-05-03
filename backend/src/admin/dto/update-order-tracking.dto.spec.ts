import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateOrderTrackingDto } from './update-order-tracking.dto';

describe('UpdateOrderTrackingDto', () => {
  it('should accept valid tracking data', async () => {
    const dto = plainToInstance(UpdateOrderTrackingDto, {
      trackingNumber: 'LP123456789CN',
      trackingUrl: 'https://track.example.com/LP123456789CN',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept only trackingNumber', async () => {
    const dto = plainToInstance(UpdateOrderTrackingDto, {
      trackingNumber: 'LP123456789CN',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject non-string trackingNumber', async () => {
    const dto = plainToInstance(UpdateOrderTrackingDto, {
      trackingNumber: 12345,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('trackingNumber');
  });

  it('should accept empty object (all optional)', async () => {
    const dto = plainToInstance(UpdateOrderTrackingDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
