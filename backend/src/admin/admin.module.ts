import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { BundlesModule } from '../bundles/bundles.module';

@Module({
  imports: [AuthModule, BundlesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
