import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { storeConfig } from '../config/store.config';

const includeItems = {
  items: {
    include: {
      product: { select: { name: true } },
    },
  },
} satisfies Prisma.OrderInclude;

type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof includeItems }>;

@Injectable()
export class TrackingService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /** Génère un magic link signé pour suivre une commande. Expire dans 90 jours. */
  generateMagicLink(orderId: string): string {
    const token = this.jwtService.sign(
      { sub: orderId, type: 'tracking' },
      { expiresIn: '90d' },
    );
    return `${storeConfig.trackingPageUrl}?token=${token}`;
  }

  /** Décode un magic link et renvoie l'order. */
  async lookupByToken(token: string) {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Lien de suivi invalide ou expiré');
    }
    if (payload.type !== 'tracking') {
      throw new UnauthorizedException('Lien de suivi invalide');
    }
    const order = await this.prisma.order.findUnique({
      where: { id: payload.sub },
      include: includeItems,
    });
    if (!order) throw new NotFoundException('Commande introuvable');
    return this.mapOrder(order);
  }

  private mapOrder = (order: OrderWithItems) => ({
    id: order.id,
    orderRef: orderRefFromId(order.id),
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    createdAt: order.createdAt,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    total: order.total,
    items: order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
    })),
  });

  async lookup(data: { orderRef?: string; orderNumber?: string; email?: string }) {
    // Lookup par référence aléatoire TF-XXXX-XXXX + email (sécurité)
    if (data.orderRef && data.email) {
      const cleanRef = data.orderRef.replace(/[^A-F0-9]/gi, '').toUpperCase();
      // On reconstruit le préfixe UUID (8 premiers chars) et on cherche
      const orders = await this.prisma.order.findMany({
        where: {
          customerEmail: { equals: data.email, mode: 'insensitive' },
        },
        include: includeItems,
      });
      const order = orders.find(
        (o) => o.id.replace(/-/g, '').toUpperCase().startsWith(cleanRef),
      );
      if (!order) throw new NotFoundException('Commande introuvable');
      return this.mapOrder(order);
    }

    if (data.orderNumber && data.email) {
      const num = parseInt(data.orderNumber, 10);
      if (!num) throw new NotFoundException('Numéro invalide');
      const order = await this.prisma.order.findFirst({
        where: {
          orderNumber: num,
          customerEmail: { equals: data.email, mode: 'insensitive' },
        },
        include: includeItems,
      });
      if (!order) throw new NotFoundException('Commande introuvable');
      return this.mapOrder(order);
    }

    throw new NotFoundException('Référence ou email manquant');
  }
}

function orderRefFromId(id: string): string {
  const clean = id.replace(/-/g, '').toUpperCase();
  return `TF-${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
}
