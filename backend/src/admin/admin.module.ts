import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { BundlesModule } from '../bundles/bundles.module';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [AuthModule, BundlesModule, TrackingModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
