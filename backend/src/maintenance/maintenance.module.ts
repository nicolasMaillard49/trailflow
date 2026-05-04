import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersCleanupService } from './orders-cleanup.service';

@Module({
  imports: [PrismaModule],
  providers: [OrdersCleanupService],
})
export class MaintenanceModule {}
