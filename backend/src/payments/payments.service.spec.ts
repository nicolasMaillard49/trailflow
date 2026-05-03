import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { BundlesService } from '../bundles/bundles.service';

const mockStripe = {
  checkout: {
    sessions: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripe);
});

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: {
    product: { findUniqueOrThrow: jest.Mock };
    order: { create: jest.Mock; update: jest.Mock; findUnique: jest.Mock };
  };
  let bundlesService: { findById: jest.Mock };

  const customerFields = {
    customerName: 'Jean Dupont',
    customerEmail: 'jean@test.com',
    customerPhone: '+33612345678',
    shippingAddress: {
      line1: '12 rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
    },
  };

  const product = {
    id: 'prod-1',
    name: 'Test Product',
    description: 'A description',
    price: 29.99,
    images: ['https://example.com/img.jpg'],
  };

  beforeEach(async () => {
    prisma = {
      product: { findUniqueOrThrow: jest.fn() },
      order: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
    };
    bundlesService = { findById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: EmailService,
          useValue: {
            sendOrderConfirmation: jest.fn(),
            sendShippingNotification: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
            getOrThrow: jest.fn().mockReturnValue('sk_test_fake'),
          },
        },
        { provide: BundlesService, useValue: bundlesService },
      ],
    }).compile();

    service = module.get(PaymentsService);
    jest.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create solo checkout at unit price * quantity', async () => {
      prisma.product.findUniqueOrThrow.mockResolvedValue(product);
      prisma.order.create.mockResolvedValue({ id: 'order-1' });
      prisma.order.update.mockResolvedValue({});
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_solo',
        url: 'https://checkout.stripe.com/solo',
      });

      const result = await service.createCheckoutSession({
        productId: 'prod-1',
        quantity: 2,
        ...customerFields,
      });

      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ total: 59.98 }),
        }),
      );
      expect(result.sessionId).toBe('cs_solo');
    });

    it('should create bundle checkout at bundle price', async () => {
      prisma.product.findUniqueOrThrow.mockResolvedValue(product);
      prisma.order.create.mockResolvedValue({ id: 'order-bundle' });
      prisma.order.update.mockResolvedValue({});
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_bundle',
        url: 'https://checkout.stripe.com/bundle',
      });
      bundlesService.findById.mockResolvedValue({
        id: 'bundle-sport',
        slug: 'sport',
        label: 'Sport',
        price: 34.99,
        active: true,
        items: [
          { productId: 'prod-1', quantity: 1, product },
          { productId: 'prod-shaker', quantity: 1, product: { id: 'prod-shaker', name: 'Shaker' } },
        ],
      });

      const result = await service.createCheckoutSession({
        productId: 'prod-1',
        quantity: 1,
        bundleId: 'bundle-sport',
        ...customerFields,
      });

      expect(bundlesService.findById).toHaveBeenCalledWith('bundle-sport');
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            total: 34.99,
            items: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({ productId: 'prod-1', bundleSlug: 'sport' }),
                expect.objectContaining({ productId: 'prod-shaker', bundleSlug: 'sport' }),
              ]),
            }),
          }),
        }),
      );
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            expect.objectContaining({
              price_data: expect.objectContaining({
                unit_amount: 3499,
                product_data: expect.objectContaining({ name: 'Sport' }),
              }),
              quantity: 1,
            }),
          ],
        }),
      );
      expect(result.sessionId).toBe('cs_bundle');
    });

    it('should reject inactive bundle', async () => {
      prisma.product.findUniqueOrThrow.mockResolvedValue(product);
      bundlesService.findById.mockResolvedValue({
        id: 'bundle-old',
        slug: 'old',
        label: 'Old',
        price: 10,
        active: false,
        items: [],
      });

      await expect(
        service.createCheckoutSession({
          productId: 'prod-1',
          quantity: 1,
          bundleId: 'bundle-old',
          ...customerFields,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when bundle not found', async () => {
      prisma.product.findUniqueOrThrow.mockResolvedValue(product);
      bundlesService.findById.mockRejectedValue(new NotFoundException('Bundle not found'));

      await expect(
        service.createCheckoutSession({
          productId: 'prod-1',
          quantity: 1,
          bundleId: 'nonexistent',
          ...customerFields,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not crash when images[0] is undefined', async () => {
      const productNoImages = { ...product, images: [] };
      prisma.product.findUniqueOrThrow.mockResolvedValue(productNoImages);
      prisma.order.create.mockResolvedValue({ id: 'order-2' });
      prisma.order.update.mockResolvedValue({});
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_456',
        url: 'https://checkout.stripe.com/session',
      });

      const result = await service.createCheckoutSession({
        productId: 'prod-1',
        quantity: 1,
        ...customerFields,
      });
      expect(result.sessionId).toBe('cs_test_456');
    });
  });

  describe('handleWebhook', () => {
    it('should update order status on checkout.session.completed', async () => {
      const session = { id: 'cs_test', payment_intent: 'pi_test' };
      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: session },
      });
      prisma.order.update.mockResolvedValue({
        id: 'order-1',
        orderNumber: 1,
        customerName: 'Jean',
        customerEmail: 'jean@test.com',
        total: 29.99,
        items: [{ product: { name: 'Mon Produit' }, quantity: 1, price: 29.99 }],
        shippingAddress: { line1: '12 rue', city: 'Paris', postalCode: '75001' },
      });

      const result = await service.handleWebhook(Buffer.from(''), 'sig');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { stripeSessionId: 'cs_test' },
        data: { status: 'PAID', stripePaymentId: 'pi_test' },
        include: { items: { include: { product: true } } },
      });
      expect(result).toEqual({ received: true });
    });
  });

  describe('cancelOrder', () => {
    it('should cancel pending order', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'PENDING' });
      prisma.order.update.mockResolvedValue({});

      const result = await service.cancelOrder('cs_test');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'CANCELLED' },
      });
      expect(result).toEqual({ cancelled: true });
    });
  });
});
