import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { TrackingService } from './tracking.service';
import { LookupTrackingDto } from './dto/lookup-tracking.dto';

@Controller('tracking')
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

  @Post('lookup')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  lookup(@Body() dto: LookupTrackingDto) {
    return this.trackingService.lookup(dto);
  }

  @Get('magic')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  magic(@Query('token') token: string) {
    return this.trackingService.lookupByToken(token);
  }
}
