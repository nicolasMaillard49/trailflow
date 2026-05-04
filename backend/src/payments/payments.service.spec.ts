import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { BundlesService } from '../bundles/bundles.service';
import { TrackingService } from '../tracking/tracking.service';
import { MetaCapiService } from '../meta-capi/meta-capi.service';

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
    order: { create: jest.Mock; update: jest.Mock; updateMany: jest.Mock; findUnique: jest.Mock };
    processedStripeEvent: { create: jest.Mock };
  };
  let bundlesService: { findById: jest.Mock };
  let emailService: { sendOrderConfirmation: jest.Mock; sendShippingNotification: jest.Mock };
  let trackingService: { generateMagicLink: jest.Mock };
  let metaCapi: { sendPurchase: jest.Mock; isConfigured: jest.Mock };

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
      order: {
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn(),
      },
      processedStripeEvent: { create: jest.fn().mockResolvedValue({}) },
    };
    bundlesService = { findById: jest.fn() };
    emailService = {
      sendOrderConfirmation: jest.fn(),
      sendShippingNotification: jest.fn(),
    };
    trackingService = {
      generateMagicLink: jest.fn().mockReturnValue('https://example.test/suivi?token=mock'),
    };
    metaCapi = {
      sendPurchase: jest.fn().mockResolvedValue(undefined),
      isConfigured: jest.fn().mockReturnValue(false),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: emailService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
            getOrThrow: jest.fn().mockReturnValue('sk_test_fake'),
          },
        },
        { provide: BundlesService, useValue: bundlesService },
        { provide: TrackingService, useValue: trackingService },
        { provide: MetaCapiService, useValue: metaCapi },
      ],
    }).compile();

    service = module.get(PaymentsService);
    jest.clearAllMocks();
    // Re-set defaults après clearAllMocks
    prisma.order.updateMany.mockResolvedValue({ count: 1 });
    prisma.processedStripeEvent.create.mockResolvedValue({});
    trackingService.generateMagicLink.mockReturnValue('https://example.test/suivi?token=mock');
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

    it('should create multi-item checkout (vest + flask addon)', async () => {
      const vest = { ...product, id: 'prod-vest', name: 'Gilet TrailFlow', price: 34.9 };
      const flask = { id: 'prod-flask', name: 'Pack 2 flasques 500ml', description: 'flasques', price: 15, images: [], stripeImage: null };
      // Deux fetch consécutifs (Promise.all interne) — on prépare la stub.
      prisma.product.findUniqueOrThrow
        .mockResolvedValueOnce(vest)
        .mockResolvedValueOnce(flask);
      prisma.order.create.mockResolvedValue({ id: 'order-multi' });
      prisma.order.update.mockResolvedValue({});
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_multi',
        client_secret: 'cs_multi_secret',
      });

      const result = await service.createCheckoutSession({
        items: [
          { productId: 'prod-vest', quantity: 1, size: 'M', color: 'Gris perle' },
          { productId: 'prod-flask', quantity: 1 }, // pas de size/color
        ],
        ...customerFields,
      });

      // 2 OrderItems créés avec size/color normalisés "" → null pour la flasque.
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            total: 49.9,
            items: expect.objectContaining({
              create: [
                expect.objectContaining({
                  productId: 'prod-vest', quantity: 1, price: 34.9,
                  size: 'M', color: 'Gris perle', bundleSlug: null,
                }),
                expect.objectContaining({
                  productId: 'prod-flask', quantity: 1, price: 15,
                  size: null, color: null, bundleSlug: null,
                }),
              ],
            }),
          }),
        }),
      );

      // 2 line_items Stripe avec leurs prix unitaires respectifs.
      const stripeCall = mockStripe.checkout.sessions.create.mock.calls[0][0];
      expect(stripeCall.line_items).toHaveLength(2);
      expect(stripeCall.line_items[0]).toEqual(
        expect.objectContaining({
          quantity: 1,
          price_data: expect.objectContaining({
            unit_amount: 3490,
            product_data: expect.objectContaining({ name: 'Gilet TrailFlow' }),
          }),
        }),
      );
      expect(stripeCall.line_items[1]).toEqual(
        expect.objectContaining({
          quantity: 1,
          price_data: expect.objectContaining({
            unit_amount: 1500,
            product_data: expect.objectContaining({ name: 'Pack 2 flasques 500ml' }),
          }),
        }),
      );
      expect(result.sessionId).toBe('cs_multi');
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
    const sampleOrder = {
      id: 'order-1',
      orderNumber: 1,
      customerName: 'Jean',
      customerEmail: 'jean@test.com',
      total: 29.99,
      items: [{ product: { name: 'Mon Produit' }, quantity: 1, price: 29.99 }],
      shippingAddress: { line1: '12 rue', city: 'Paris', postalCode: '75001' },
    };

    beforeEach(() => {
      mockStripe.webhooks.constructEvent.mockReturnValue({
        id: 'evt_123',
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test', payment_intent: 'pi_test' } },
      });
    });

    it('should mark order PAID and trigger email on first delivery', async () => {
      prisma.order.updateMany.mockResolvedValue({ count: 1 });
      prisma.order.findUnique.mockResolvedValue(sampleOrder);

      const result = await service.handleWebhook(Buffer.from(''), 'sig');

      expect(prisma.processedStripeEvent.create).toHaveBeenCalledWith({
        data: { eventId: 'evt_123', type: 'checkout.session.completed' },
      });
      expect(prisma.order.updateMany).toHaveBeenCalledWith({
        where: { stripeSessionId: 'cs_test', status: 'PENDING' },
        data: { status: 'PAID', stripePaymentId: 'pi_test' },
      });
      expect(emailService.sendOrderConfirmation).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ received: true });
    });

    it('should be idempotent: a duplicate eventId is ignored without re-sending email', async () => {
      // Simule la collision unique sur ProcessedStripeEvent
      prisma.processedStripeEvent.create.mockRejectedValueOnce({ code: 'P2002' });

      const result = await service.handleWebhook(Buffer.from(''), 'sig');

      expect(result).toEqual({ received: true, duplicate: true });
      expect(prisma.order.updateMany).not.toHaveBeenCalled();
      expect(emailService.sendOrderConfirmation).not.toHaveBeenCalled();
    });

    it('should not re-send email if order is already PAID (race after first delivery)', async () => {
      // L'event est nouveau (pas en table), mais un autre worker vient de marquer la commande PAID
      prisma.order.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.handleWebhook(Buffer.from(''), 'sig');

      expect(result).toEqual({ received: true, alreadyProcessed: true });
      expect(emailService.sendOrderConfirmation).not.toHaveBeenCalled();
      expect(prisma.order.findUnique).not.toHaveBeenCalled();
    });

    it('should propagate non-P2002 prisma errors when recording the event', async () => {
      prisma.processedStripeEvent.create.mockRejectedValueOnce(new Error('DB down'));

      await expect(service.handleWebhook(Buffer.from(''), 'sig')).rejects.toThrow('DB down');
      expect(emailService.sendOrderConfirmation).not.toHaveBeenCalled();
    });

    it('should ignore non-checkout events (eg payment_intent.succeeded)', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValue({
        id: 'evt_other',
        type: 'payment_intent.succeeded',
        data: { object: {} },
      });

      const result = await service.handleWebhook(Buffer.from(''), 'sig');

      expect(result).toEqual({ received: true });
      expect(prisma.order.updateMany).not.toHaveBeenCalled();
      expect(emailService.sendOrderConfirmation).not.toHaveBeenCalled();
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
