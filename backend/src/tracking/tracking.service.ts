import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async lookup(data: { orderNumber?: string; name?: string; email?: string }) {
    const includeItems = {
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
    };

    const mapOrder = (order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      createdAt: order.createdAt,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      items: order.items.map((item: any) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    if (data.orderNumber) {
      const num = parseInt(data.orderNumber, 10);
      const order = await this.prisma.order.findUnique({
        where: num ? { orderNumber: num } : { id: data.orderNumber },
        include: includeItems,
      });
      if (!order) throw new NotFoundException('Commande introuvable');
      return mapOrder(order);
    }

    if (data.name && data.email) {
      const orders = await this.prisma.order.findMany({
        where: {
          customerName: { equals: data.name, mode: 'insensitive' },
          customerEmail: { equals: data.email, mode: 'insensitive' },
        },
        orderBy: { createdAt: 'desc' },
        include: includeItems,
      });
      if (orders.length === 0) throw new NotFoundException('Aucune commande trouvee');
      return orders.map(mapOrder);
    }

    throw new NotFoundException('Commande introuvable');
  }
}
