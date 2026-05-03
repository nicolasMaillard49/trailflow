import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { TrackingService } from '../tracking/tracking.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateOrderTrackingDto } from './dto/update-order-tracking.dto';
import { UpdateOrderSupplierDto } from './dto/update-order-supplier.dto';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private trackingService: TrackingService,
  ) {}

  async getDashboard() {
    const totalOrders = await this.prisma.order.count();
    const paidOrders = await this.prisma.order.count({
      where: { status: 'PAID' },
    });
    const totalRevenue = await this.prisma.order.aggregate({
      where: {
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
      },
      _sum: { total: true },
    });
    const recentOrders = await this.prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });

    // Monthly stats for profitability
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyOrders = await this.prisma.order.findMany({
      where: {
        status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        createdAt: { gte: startOfMonth },
      },
      include: { items: true },
    });

    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.total, 0);
    const monthlyOrderCount = monthlyOrders.length;
    const monthlyUnitsSold = monthlyOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, item) => s + item.quantity, 0),
      0,
    );

    const product = await this.prisma.product.findFirst();

    return {
      totalOrders,
      paidOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        orderRef: orderRefFromId(o.id),
      })),
      monthly: {
        revenue: monthlyRevenue,
        orderCount: monthlyOrderCount,
        unitsSold: monthlyUnitsSold,
      },
      productCostPrice: product?.costPrice || 0,
      productPrice: product?.price || 0,
    };
  }

  async getOrders(page = 1, limit = 20) {
    const orders = await this.prisma.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });
    const total = await this.prisma.order.count();
    const ordersWithRef = orders.map((o) => ({
      ...o,
      orderRef: orderRefFromId(o.id),
    }));
    return { orders: ordersWithRef, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateOrderStatus(id: string, status: string) {
    // Lit l'ancien statut AVANT update pour détecter une vraie transition vers SHIPPED
    const before = await this.prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });
    const order = await this.prisma.order.update({
      where: { id },
      data: { status: status as any },
    });

    // N'envoie l'email que si on PASSE à SHIPPED (pas si déjà SHIPPED)
    if (
      status === 'SHIPPED' &&
      before?.status !== 'SHIPPED' &&
      order.customerEmail
    ) {
      const magicLink = this.trackingService.generateMagicLink(order.id);
      this.emailService.sendShippingNotification({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        trackingNumber: order.trackingNumber || undefined,
        trackingUrl: order.trackingUrl || undefined,
        trackingMagicLink: magicLink,
      });
    }

    return order;
  }

  async updateOrderTracking(id: string, data: UpdateOrderTrackingDto) {
    // Idem : on lit avant pour ne pas double-envoyer si tracking re-soumis ou
    // si le status est déjà SHIPPED (l'email a déjà été déclenché par updateOrderStatus)
    const before = await this.prisma.order.findUnique({
      where: { id },
      select: { trackingNumber: true, status: true },
    });
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl,
      },
    });

    const isFirstTracking = !before?.trackingNumber && !!data.trackingNumber;
    const notAlreadyShipped = before?.status !== 'SHIPPED';
    if (isFirstTracking && notAlreadyShipped && order.customerEmail) {
      const magicLink = this.trackingService.generateMagicLink(order.id);
      this.emailService.sendShippingNotification({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        trackingNumber: data.trackingNumber,
        trackingUrl: data.trackingUrl,
        trackingMagicLink: magicLink,
      });
    }

    return order;
  }

  async updateOrderSupplier(id: string, data: UpdateOrderSupplierDto) {
    const updateData: Record<string, string | null> = {};
    if (data.supplierOrderId !== undefined) updateData.supplierOrderId = data.supplierOrderId || null;
    if (data.supplierUrl !== undefined) updateData.supplierUrl = data.supplierUrl || null;
    return this.prisma.order.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteOrder(id: string) {
    await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
    return this.prisma.order.delete({ where: { id } });
  }

  async getProducts() {
    return this.prisma.product.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, slug: true, costPrice: true, supplierUrl: true, active: true },
    });
  }

  async updateProduct(id: string, data: UpdateProductDto) {
    return this.prisma.product.update({ where: { id }, data });
  }

  async getProduct(id?: string) {
    if (id) {
      return this.prisma.product.findUnique({ where: { id } });
    }
    return this.prisma.product.findFirst({ where: { active: true } });
  }
}

/** Référence commande aléatoire dérivée de l'UUID Prisma : `TF-XXXX-XXXX`. */
function orderRefFromId(id: string): string {
  const clean = id.replace(/-/g, '').toUpperCase();
  return `TF-${clean.slice(0, 4)}-${clean.slice(4, 8)}`;
}
