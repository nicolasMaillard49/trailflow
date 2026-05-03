import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { BundlesModule } from '../bundles/bundles.module';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [BundlesModule, TrackingModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
