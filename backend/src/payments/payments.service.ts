import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { BundlesService } from '../bundles/bundles.service';
import { TrackingService } from '../tracking/tracking.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;
  private readonly frontendUrl: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private emailService: EmailService,
    private bundlesService: BundlesService,
    private trackingService: TrackingService,
  ) {
    this.stripe = new Stripe(this.configService.getOrThrow('STRIPE_SECRET_KEY'));
    this.frontendUrl = this.resolveFrontendUrl();
  }

  /**
   * On valide explicitement le protocole pour éviter qu'une fuite d'env (ex: leak
   * `javascript:` ou un schéma custom) ne se traduise en redirect arbitraire dans
   * la session Stripe (`success_url`, `return_url`).
   */
  private resolveFrontendUrl(): string {
    const raw = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      throw new Error(`FRONTEND_URL invalide: "${raw}" n'est pas une URL valide`);
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`FRONTEND_URL doit utiliser http:// ou https:// (reçu: ${parsed.protocol})`);
    }
    // Normalise (pas de slash final pour éviter les // dans les URLs construites)
    return raw.replace(/\/+$/, '');
  }

  async createCheckoutSession(dto: CreateCheckoutDto) {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id: dto.productId },
    });

    let totalCents: number;
    let stripeUnitAmount: number;
    let displayName: string;
    let orderItems: {
      productId: string;
      quantity: number;
      price: number;
      bundleSlug: string | null;
      size: string | null;
      color: string | null;
    }[];

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
        // Bundle = combo avec choix au moment de la prépa, on n'enregistre pas
        // de taille/couleur ici — l'acheteur choisira au SAV si besoin.
        size: null,
        color: null,
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
        size: dto.size || null,
        color: dto.color || null,
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
                const url = img.startsWith('http') ? img : `${this.frontendUrl}${img}`;
                return [url];
              })(),
            },
            unit_amount: stripeUnitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: order.id, sport: dto.sport || '' },
      return_url: `${this.frontendUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
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

    // Idempotence : Stripe peut renvoyer le même event plusieurs fois (timeout,
    // retry après 5xx). On enregistre l'event en premier ; si la création
    // échoue avec P2002 (unique violation sur `eventId`), c'est un duplicate.
    try {
      await this.prisma.processedStripeEvent.create({
        data: { eventId: event.id, type: event.type },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        this.logger.warn(`Stripe event déjà traité, on ignore: ${event.id} (${event.type})`);
        return { received: true, duplicate: true };
      }
      throw err;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Garde-fou : on ne re-traite jamais une order déjà PAID. updateMany ne
      // throw pas si 0 ligne ne match (vs update), ce qui évite les races.
      const updated = await this.prisma.order.updateMany({
        where: { stripeSessionId: session.id, status: 'PENDING' },
        data: {
          status: 'PAID',
          stripePaymentId: session.payment_intent as string,
        },
      });

      if (updated.count === 0) {
        this.logger.warn(`checkout.session.completed reçu pour ${session.id} mais aucune order PENDING — déjà payée ou inconnue`);
        return { received: true, alreadyProcessed: true };
      }

      const order = await this.prisma.order.findUnique({
        where: { stripeSessionId: session.id },
        include: { items: { include: { product: true } } },
      });

      if (!order) {
        // updateMany a fait count=1 mais la row est introuvable → état impossible
        this.logger.error(`Order introuvable après update pour session ${session.id}`);
        return { received: true };
      }

      const magicLink = this.trackingService.generateMagicLink(order.id);
      this.emailService.sendOrderConfirmation({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        total: order.total,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size ?? undefined,
          color: item.color ?? undefined,
        })),
        shippingAddress: order.shippingAddress as any,
        trackingMagicLink: magicLink,
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
    // Whitelist : on n'expose au front QUE ce qui est utile à la confirmation.
    return {
      session: {
        id: session.id,
        status: session.status,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        customer_details: session.customer_details
          ? { email: session.customer_details.email }
          : null,
      },
      order: order
        ? {
            id: order.id,
            orderRef: orderRefFromId(order.id),
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            total: order.total,
            status: order.status,
            createdAt: order.createdAt,
            // Magic link signé pour suivre la commande sans login
            trackingMagicLink: this.trackingService.generateMagicLink(order.id),
            items: order.items.map((i) => ({
              name: i.product?.name || 'Article',
              quantity: i.quantity,
              price: i.price,
              variant: i.variant,
            })),
          }
        : null,
    };
  }
}

/**
 * Référence commande aléatoire dérivée de l'UUID Prisma : `TF-XXXX-XXXX`.
 * Stable (même résultat pour le même order), aléatoire-looking.
 */
function orderRefFromId(id: string): string {
  const clean = id.replace(/-/g, '').toUpperCase();
  return `TF-${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
}
