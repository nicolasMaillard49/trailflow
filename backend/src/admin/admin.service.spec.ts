import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: {
    order: {
      count: jest.Mock;
      aggregate: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    orderItem: { deleteMany: jest.Mock };
    product: { findFirst: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      order: {
        count: jest.fn(),
        aggregate: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      orderItem: { deleteMany: jest.fn() },
      product: { findFirst: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: EmailService,
          useValue: {
            sendOrderConfirmation: jest.fn(),
            sendShippingNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AdminService);
  });

  describe('getDashboard', () => {
    it('should return dashboard metrics with monthly profitability data', async () => {
      prisma.order.count
        .mockResolvedValueOnce(50) // totalOrders
        .mockResolvedValueOnce(30); // paidOrders
      prisma.order.aggregate.mockResolvedValue({ _sum: { total: 1500.5 } });
      prisma.order.findMany
        .mockResolvedValueOnce([{ id: 'order-1' }]) // recentOrders
        .mockResolvedValueOnce([{ id: 'monthly-1', total: 29.99, items: [{ quantity: 1 }] }]); // monthlyOrders
      prisma.product.findFirst.mockResolvedValue({ id: 'prod-1', costPrice: 12, price: 29.99 });

      const result = await service.getDashboard();

      expect(result).toEqual({
        totalOrders: 50,
        paidOrders: 30,
        totalRevenue: 1500.5,
        recentOrders: [{ id: 'order-1' }],
        monthly: {
          revenue: 29.99,
          orderCount: 1,
          unitsSold: 1,
        },
        productCostPrice: 12,
        productPrice: 29.99,
      });
    });

    it('should return 0 revenue when no paid orders', async () => {
      prisma.order.count.mockResolvedValue(0);
      prisma.order.aggregate.mockResolvedValue({ _sum: { total: null } });
      prisma.order.findMany.mockResolvedValue([]);
      prisma.product.findFirst.mockResolvedValue(null);

      const result = await service.getDashboard();

      expect(result.totalRevenue).toBe(0);
      expect(result.monthly).toEqual({ revenue: 0, orderCount: 0, unitsSold: 0 });
      expect(result.productCostPrice).toBe(0);
    });
  });

  describe('getOrders', () => {
    it('should return paginated orders', async () => {
      const orders = [{ id: 'order-1' }, { id: 'order-2' }];
      prisma.order.findMany.mockResolvedValue(orders);
      prisma.order.count.mockResolvedValue(50);

      const result = await service.getOrders(2, 20);

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 20 }),
      );
      expect(result).toEqual({
        orders,
        total: 50,
        page: 2,
        totalPages: 3,
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const updated = { id: 'order-1', status: 'SHIPPED' };
      prisma.order.update.mockResolvedValue(updated);

      const result = await service.updateOrderStatus('order-1', 'SHIPPED');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'SHIPPED' },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('updateOrderTracking', () => {
    it('should update tracking number and URL', async () => {
      const updated = {
        id: 'order-1', orderNumber: 1, customerName: 'Test', customerEmail: 'test@test.com',
        trackingNumber: 'LP123CN', trackingUrl: 'https://track.example.com/LP123CN',
      };
      prisma.order.update.mockResolvedValue(updated);

      const result = await service.updateOrderTracking('order-1', {
        trackingNumber: 'LP123CN',
        trackingUrl: 'https://track.example.com/LP123CN',
      });

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: {
          trackingNumber: 'LP123CN',
          trackingUrl: 'https://track.example.com/LP123CN',
        },
      });
      expect(result).toEqual(updated);
    });

    it('should update only tracking number when URL is omitted', async () => {
      prisma.order.update.mockResolvedValue({
        id: 'order-1', orderNumber: 1, customerName: 'Test', customerEmail: 'test@test.com',
        trackingNumber: 'LP456CN',
      });

      await service.updateOrderTracking('order-1', { trackingNumber: 'LP456CN' });

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: {
          trackingNumber: 'LP456CN',
          trackingUrl: undefined,
        },
      });
    });
  });

  describe('updateOrderSupplier', () => {
    it('should save supplier order ID and URL', async () => {
      const updated = { id: 'order-1', supplierOrderId: '82156372849', supplierUrl: 'https://aliexpress.com/order/82156372849' };
      prisma.order.update.mockResolvedValue(updated);

      const result = await service.updateOrderSupplier('order-1', {
        supplierOrderId: '82156372849',
        supplierUrl: 'https://aliexpress.com/order/82156372849',
      });

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: {
          supplierOrderId: '82156372849',
          supplierUrl: 'https://aliexpress.com/order/82156372849',
        },
      });
      expect(result).toEqual(updated);
    });

    it('should set null when supplier ID is empty string', async () => {
      prisma.order.update.mockResolvedValue({ id: 'order-1', supplierOrderId: null });

      await service.updateOrderSupplier('order-1', {
        supplierOrderId: '',
      });

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: expect.objectContaining({ supplierOrderId: null }),
      });
    });

    it('should only update provided fields', async () => {
      prisma.order.update.mockResolvedValue({ id: 'order-1' });

      await service.updateOrderSupplier('order-1', {
        supplierOrderId: '12345',
      });

      const callData = prisma.order.update.mock.calls[0][0].data;
      expect(callData.supplierOrderId).toBe('12345');
      expect(callData).not.toHaveProperty('supplierUrl');
    });
  });

  describe('getDashboard — monthly edge cases', () => {
    it('should calculate monthly revenue from multiple orders', async () => {
      prisma.order.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);
      prisma.order.aggregate.mockResolvedValue({ _sum: { total: 500 } });
      prisma.order.findMany
        .mockResolvedValueOnce([]) // recentOrders
        .mockResolvedValueOnce([
          { id: 'm1', total: 29.99, items: [{ quantity: 1 }] },
          { id: 'm2', total: 49.99, items: [{ quantity: 2 }] },
          { id: 'm3', total: 99.99, items: [{ quantity: 5 }, { quantity: 1 }] },
        ]); // monthlyOrders
      prisma.product.findFirst.mockResolvedValue({ costPrice: 12, price: 29.99 });

      const result = await service.getDashboard();

      expect(result.monthly.revenue).toBeCloseTo(179.97, 2);
      expect(result.monthly.orderCount).toBe(3);
      expect(result.monthly.unitsSold).toBe(9); // 1 + 2 + 5 + 1
    });

    it('should exclude PENDING/CANCELLED from monthly revenue', async () => {
      prisma.order.count.mockResolvedValue(0);
      prisma.order.aggregate.mockResolvedValue({ _sum: { total: null } });
      // The findMany with status filter is handled by Prisma, so monthlyOrders returns only matching
      prisma.order.findMany
        .mockResolvedValueOnce([]) // recentOrders
        .mockResolvedValueOnce([]); // monthlyOrders (only PAID/PROCESSING/SHIPPED/DELIVERED)
      prisma.product.findFirst.mockResolvedValue(null);

      const result = await service.getDashboard();

      expect(result.monthly.revenue).toBe(0);
      expect(result.monthly.orderCount).toBe(0);
      expect(result.monthly.unitsSold).toBe(0);
    });
  });

  describe('deleteOrder', () => {
    it('should delete OrderItems then Order', async () => {
      prisma.orderItem.deleteMany.mockResolvedValue({ count: 2 });
      prisma.order.delete.mockResolvedValue({ id: 'order-del' });

      const result = await service.deleteOrder('order-del');

      expect(prisma.orderItem.deleteMany).toHaveBeenCalledWith({
        where: { orderId: 'order-del' },
      });
      expect(prisma.order.delete).toHaveBeenCalledWith({
        where: { id: 'order-del' },
      });
      expect(result).toEqual({ id: 'order-del' });
    });

    it('should throw if order ID does not exist', async () => {
      prisma.orderItem.deleteMany.mockResolvedValue({ count: 0 });
      prisma.order.delete.mockRejectedValue(
        new Error('Record to delete does not exist.'),
      );

      await expect(service.deleteOrder('nonexistent')).rejects.toThrow(
        'Record to delete does not exist.',
      );
    });

    it('should handle order with 0 items', async () => {
      prisma.orderItem.deleteMany.mockResolvedValue({ count: 0 });
      prisma.order.delete.mockResolvedValue({ id: 'order-empty' });

      const result = await service.deleteOrder('order-empty');

      expect(prisma.orderItem.deleteMany).toHaveBeenCalled();
      expect(result).toEqual({ id: 'order-empty' });
    });

    it('should delete order with multiple items', async () => {
      prisma.orderItem.deleteMany.mockResolvedValue({ count: 5 });
      prisma.order.delete.mockResolvedValue({ id: 'order-multi' });

      const result = await service.deleteOrder('order-multi');

      expect(prisma.orderItem.deleteMany).toHaveBeenCalledWith({
        where: { orderId: 'order-multi' },
      });
      expect(result).toEqual({ id: 'order-multi' });
    });
  });

  describe('getProduct', () => {
    it('should return the product', async () => {
      const product = { id: 'prod-1', name: 'Test' };
      prisma.product.findFirst.mockResolvedValue(product);

      const result = await service.getProduct();

      expect(result).toEqual(product);
    });
  });

  describe('updateProduct', () => {
    it('should update and return the product', async () => {
      const updated = { id: 'prod-1', name: 'Updated', price: 39.99 };
      prisma.product.update.mockResolvedValue(updated);

      const result = await service.updateProduct('prod-1', {
        name: 'Updated',
        price: 39.99,
      });

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { name: 'Updated', price: 39.99 },
      });
      expect(result).toEqual(updated);
    });

    it('should update product with supplierUrl', async () => {
      const updated = { id: 'prod-1', supplierUrl: 'https://aliexpress.com/item/123.html' };
      prisma.product.update.mockResolvedValue(updated);

      const result = await service.updateProduct('prod-1', {
        supplierUrl: 'https://aliexpress.com/item/123.html',
      });

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { supplierUrl: 'https://aliexpress.com/item/123.html' },
      });
      expect(result).toEqual(updated);
    });

    it('should clear supplierUrl when set to null', async () => {
      prisma.product.update.mockResolvedValue({ id: 'prod-1', supplierUrl: null });

      await service.updateProduct('prod-1', { supplierUrl: undefined });

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { supplierUrl: undefined },
      });
    });
  });
});
