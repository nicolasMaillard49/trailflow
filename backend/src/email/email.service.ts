import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { orderConfirmationTemplate } from './templates/order-confirmation';
import { shippingNotificationTemplate } from './templates/shipping-notification';
import { storeConfig, formatOrderNumber } from '../config/store.config';

export interface OrderEmailData {
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country?: string;
  };
}

export interface ShippingEmailData {
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

@Injectable()
export class EmailService {
  private resend: Resend;
  private from: string;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('RESEND_API_KEY');
    this.resend = new Resend(apiKey || 'missing_key');
    this.from = storeConfig.emailFrom;
  }

  async sendOrderConfirmation(data: OrderEmailData) {
    const orderNum = formatOrderNumber(data.orderNumber);
    const storeInfo = { storeName: storeConfig.storeName, storeUrl: storeConfig.storeUrl, orderNum };

    // 1. Email client
    try {
      this.logger.log(`Sending order confirmation from="${this.from}" to="${data.customerEmail}"`);
      const result = await this.resend.emails.send({
        from: this.from,
        to: data.customerEmail,
        subject: `Commande confirmee #${orderNum}`,
        html: orderConfirmationTemplate(data, storeInfo),
      });
      this.logger.log(`Resend response: ${JSON.stringify(result)}`);
      this.logger.log(`Order confirmation sent to ${data.customerEmail} (${result.data?.id})`);
    } catch (error) {
      this.logger.error(`Failed to send order confirmation to ${data.customerEmail}`, error);
    }

    // 2. Email admin notification
    const adminEmail = this.configService.get('ADMIN_EMAIL');
    if (adminEmail) {
      try {
        const itemsList = data.items
          .map((i) => `${i.name} x${i.quantity} — ${i.price.toFixed(2)}€`)
          .join('\n');
        const addr = data.shippingAddress;
        const addrStr = [addr.line1, addr.line2, `${addr.postalCode} ${addr.city}`, addr.country || 'FR']
          .filter(Boolean)
          .join(', ');

        await this.resend.emails.send({
          from: this.from,
          to: adminEmail,
          subject: `🛒 Nouvelle commande #${orderNum} — ${data.total.toFixed(2)}€`,
          html: `
            <h2>Nouvelle commande !</h2>
            <p><strong>Client :</strong> ${data.customerName} (${data.customerEmail})</p>
            <p><strong>Articles :</strong><br/>${itemsList.replace(/\n/g, '<br/>')}</p>
            <p><strong>Total :</strong> ${data.total.toFixed(2)}€</p>
            <p><strong>Adresse :</strong> ${addrStr}</p>
            <p><a href="${storeConfig.adminDashboardUrl}">Voir dans le dashboard</a></p>
          `,
        });
        this.logger.log(`Admin notification sent to ${adminEmail}`);
      } catch (error) {
        this.logger.error(`Failed to send admin notification`, error);
      }
    }
  }

  async sendShippingNotification(data: ShippingEmailData) {
    const orderNum = formatOrderNumber(data.orderNumber);
    const storeInfo = { storeName: storeConfig.storeName, storeUrl: storeConfig.storeUrl, orderNum };

    try {
      const result = await this.resend.emails.send({
        from: this.from,
        to: data.customerEmail,
        subject: `Votre commande #${orderNum} a ete expediee !`,
        html: shippingNotificationTemplate(data, storeInfo),
      });
      this.logger.log(`Shipping notification sent to ${data.customerEmail} (${result.data?.id})`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send shipping notification to ${data.customerEmail}`, error);
    }
  }
}
