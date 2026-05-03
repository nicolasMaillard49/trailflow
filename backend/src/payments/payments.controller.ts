import { Controller, Post, Body, Headers, Req, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { SessionIdDto } from './dto/session-id.dto';
import type { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-checkout')
  createCheckout(@Body() dto: CreateCheckoutDto) {
    return this.paymentsService.createCheckoutSession(dto);
  }

  @Post('webhook')
  webhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    // With bodyParser disabled for this route + express.raw(), req.body is a Buffer
    const payload = req.body as Buffer;
    return this.paymentsService.handleWebhook(payload, signature);
  }

  @Post('cancel-order')
  cancelOrder(@Body() dto: SessionIdDto) {
    return this.paymentsService.cancelOrder(dto.session_id);
  }

  @Get('session-status')
  getSessionStatus(@Query() dto: SessionIdDto) {
    return this.paymentsService.getSessionStatus(dto.session_id);
  }
}
