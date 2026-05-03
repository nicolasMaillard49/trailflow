import { Controller, Get } from '@nestjs/common';
import { BundlesService } from './bundles.service';

@Controller('bundles')
export class BundlesController {
  constructor(private bundlesService: BundlesService) {}

  @Get()
  findActive() {
    return this.bundlesService.findActive();
  }
}
