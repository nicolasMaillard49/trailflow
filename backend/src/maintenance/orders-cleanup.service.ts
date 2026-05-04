import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Purge des paniers abandonnés. Une order PENDING qui n'a pas été payée en 7
 * jours ne reviendra pas (la session Stripe a expiré au bout de 24h, l'acheteur
 * est parti). On bascule en CANCELLED — pas de hard delete, on garde la trace
 * pour analyser l'abandon de panier (taux PENDING vs PAID).
 *
 * Cron quotidien à 03:00 UTC (creux de trafic).
 */
@Injectable()
export class OrdersCleanupService {
  private readonly logger = new Logger(OrdersCleanupService.name);
  private static readonly STALE_DAYS = 7;

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cancelStalePendingOrders() {
    const cutoff = new Date(Date.now() - OrdersCleanupService.STALE_DAYS * 24 * 60 * 60 * 1000);
    const result = await this.prisma.order.updateMany({
      where: { status: 'PENDING', createdAt: { lt: cutoff } },
      data: { status: 'CANCELLED' },
    });
    if (result.count > 0) {
      this.logger.log(`Annulé ${result.count} order(s) PENDING > ${OrdersCleanupService.STALE_DAYS}j (cutoff: ${cutoff.toISOString()})`);
    }
    return result.count;
  }
}
