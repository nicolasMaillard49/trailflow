import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { BundlesService } from '../bundles/bundles.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private emailService: EmailService,
    private bundlesService: BundlesService,
  ) {
    this.stripe = new Stripe(this.configService.getOrThrow('STRIPE_SECRET_KEY'));
  }

  async createCheckoutSession(dto: CreateCheckoutDto) {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id: dto.productId },
    });

    let totalCents: number;
    let stripeUnitAmount: number;
    let displayName: string;
    let orderItems: { productId: string; quantity: number; price: number; bundleSlug: string | null }[];

    if (dto.bundleId) {
      const bundle = await this.bundlesService.findById(dto.bundleId);
      if (!bundle.active) {
        throw new BadRequestException('This bundle is no longer available');
      }

      totalCents = Math.round(bundle.price * 100);
      stripeUnitAmount = totalCents;
      displayName = bundle.label;

      const totalQty = bundle.items.reduce((sum, i) => sum + i.quantity, 0);
      orderItems = bundle.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: (bundle.price / totalQty) * item.quantity,
        bundleSlug: bundle.slug,
      }));
    } else {
      totalCents = Math.round(product.price * dto.quantity * 100);
      stripeUnitAmount = totalCents;
      displayName = dto.quantity > 1 ? `${product.name} x ${dto.quantity}` : product.name;

      orderItems = [{
        productId: product.id,
        quantity: dto.quantity,
        price: product.price,
        bundleSlug: null,
      }];
    }

    const total = totalCents / 100;

    const order = await this.prisma.order.create({
      data: {
        customerEmail: dto.customerEmail,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone || '',
        shippingAddress: {
          line1: dto.shippingAddress.line1,
          line2: dto.shippingAddress.line2 || '',
          city: dto.shippingAddress.city,
          postalCode: dto.shippingAddress.postalCode,
          country: dto.shippingAddress.country || 'FR',
        },
        total,
        items: {
          create: orderItems,
        },
      },
    });

    const session = await this.stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: dto.customerEmail,
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: displayName,
              description: product.description,
              images: (() => {
                const img = product.stripeImage || product.images[0];
                if (!img) return [];
                const url = img.startsWith('http') ? img : `${this.configService.get('FRONTEND_URL')}${img}`;
                return [url];
              })(),
            },
            unit_amount: stripeUnitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: order.id, sport: dto.sport || '' },
      return_url: `${this.configService.get('FRONTEND_URL')}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return { sessionId: session.id, clientSecret: session.client_secret };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.configService.getOrThrow('STRIPE_WEBHOOK_SECRET'),
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const order = await this.prisma.order.update({
        where: { stripeSessionId: session.id },
        data: {
          status: 'PAID',
          stripePaymentId: session.payment_intent as string,
        },
        include: { items: { include: { product: true } } },
      });

      // Send order confirmation email (non-blocking)
      this.emailService.sendOrderConfirmation({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.total,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: order.shippingAddress as any,
      });
    }

    return { received: true };
  }

  async cancelOrder(sessionId: string) {
    const order = await this.prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
    });
    if (order && order.status === 'PENDING') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
      });
    }
    return { cancelled: true };
  }

  async getSessionStatus(sessionId: string) {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    const order = await this.prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: { items: { include: { product: true } } },
    });
    return { session, order };
  }
}
