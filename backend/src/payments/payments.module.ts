import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { BundlesModule } from '../bundles/bundles.module';
import { TrackingModule } from '../tracking/tracking.module';
import { MetaCapiModule } from '../meta-capi/meta-capi.module';

@Module({
  imports: [BundlesModule, TrackingModule, MetaCapiModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
