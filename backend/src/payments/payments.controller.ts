import { Controller, Post, Body, Headers, Req, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { SessionIdDto } from './dto/session-id.dto';
import type { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // Anti-spam : un acheteur légitime ne crée que 1-2 checkouts/min. 5/min/IP
  // évite qu'un script bourre la table Order de PENDING fantômes.
  @Throttle({ default: { limit: 5, ttl: 60000 } })
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

  // Évite l'énumération de sessions Stripe (un acheteur légitime ne consulte le
  // statut que quelques fois sur sa page de confirmation).
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Get('session-status')
  getSessionStatus(@Query() dto: SessionIdDto) {
    return this.paymentsService.getSessionStatus(dto.session_id);
  }
}
