import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';
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
  /** Magic link de suivi de commande (déjà préfixé avec ?token=…) */
  trackingMagicLink?: string;
}

export interface ShippingEmailData {
  orderNumber: number;
  customerName: string;
  customerEmail: string;
  trackingNumber?: string;
  trackingUrl?: string;
  /** Magic link de suivi de commande */
  trackingMagicLink?: string;
}

type SendOpts = { from: string; to: string; subject: string; html: string };

@Injectable()
export class EmailService {
  private resend: Resend;
  private smtp: nodemailer.Transporter | null = null;
  private from: string;
  private useSmtp: boolean;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const transport = (this.configService.get('EMAIL_TRANSPORT') || 'resend').toLowerCase();
    this.useSmtp = transport === 'smtp';

    const apiKey = this.configService.get('RESEND_API_KEY');
    this.resend = new Resend(apiKey || 'missing_key');

    if (this.useSmtp) {
      this.smtp = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST') || 'localhost',
        port: parseInt(this.configService.get('SMTP_PORT') || '1025', 10),
        secure: false,
        ignoreTLS: true,
      });
    }

    this.from = storeConfig.emailFrom;
    this.logger.log(`Email transport: ${this.useSmtp ? 'SMTP (MailHog/dev)' : 'Resend (prod)'}`);
  }

  /** Wrapper unique : envoie via SMTP en dev, Resend en prod. */
  private async send(opts: SendOpts): Promise<{ id: string }> {
    if (this.useSmtp && this.smtp) {
      const info = await this.smtp.sendMail(opts);
      return { id: info.messageId };
    }
    const result = await this.resend.emails.send(opts);
    return { id: result.data?.id || 'unknown' };
  }

  async sendOrderConfirmation(data: OrderEmailData) {
    const orderNum = formatOrderNumber(data.orderNumber);
    const storeInfo = { storeName: storeConfig.storeName, storeUrl: storeConfig.storeUrl, orderNum };

    // 1. Email client
    try {
      this.logger.log(`Sending order confirmation from="${this.from}" to="${data.customerEmail}"`);
      const result = await this.send({
        from: this.from,
        to: data.customerEmail,
        subject: `Commande confirmee #${orderNum}`,
        html: orderConfirmationTemplate(data, storeInfo),
      });
      this.logger.log(`Order confirmation sent to ${data.customerEmail} (${result.id})`);
    } catch (error) {
      this.logger.error(`Failed to send order confirmation to ${data.customerEmail}`, error);
    }

    // 2. Email admin notification — DA TrailFlow
    const adminEmail = this.configService.get('ADMIN_EMAIL');
    if (adminEmail) {
      try {
        const itemsRows = data.items
          .map(
            (i) => `
          <tr>
            <td style="padding:14px 0;border-bottom:0.5px solid rgba(240,237,232,0.08);font-family:'Geist',sans-serif;font-size:13px;font-weight:300;color:#D8D4CE;">
              ${i.name} <span style="color:#7A7872;">×${i.quantity}</span>
            </td>
            <td align="right" style="padding:14px 0;border-bottom:0.5px solid rgba(240,237,232,0.08);font-family:'Cormorant Garamond',serif;font-weight:400;font-size:16px;color:#F0EDE8;">
              ${(i.price * i.quantity).toFixed(2).replace('.', ',')}€
            </td>
          </tr>`,
          )
          .join('');

        const addr = data.shippingAddress;
        const addrLines = [
          data.customerName,
          addr.line1,
          addr.line2,
          `${addr.postalCode} ${addr.city}`,
          addr.country || 'France',
        ]
          .filter(Boolean)
          .join('<br>');

        await this.send({
          from: this.from,
          to: adminEmail,
          subject: `Nouvelle commande ${orderNum} — ${data.total.toFixed(2)}€`,
          html: `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="dark">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Geist:wght@200;300;400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#0E0E0C;color:#F0EDE8;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0E0E0C;">
<tr><td align="center" style="padding:48px 16px;">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
    <tr><td align="center" style="padding:0 0 32px;">
      <span style="font-family:'Cormorant Garamond',serif;font-weight:300;font-size:22px;letter-spacing:0.22em;text-transform:uppercase;color:#F0EDE8;">
        Trail<span style="color:#7A7872;">Flow</span>
      </span>
    </td></tr>
    <tr><td align="center" style="padding:0 0 16px;">
      <span style="display:inline-block;font-family:'Geist',sans-serif;font-size:10px;font-weight:400;letter-spacing:0.28em;text-transform:uppercase;color:#2A7A5A;border:0.5px solid rgba(42,122,90,0.4);padding:8px 16px;border-radius:999px;">
        ★ Nouvelle commande
      </span>
    </td></tr>
    <tr><td align="center" style="padding:0 24px 32px;">
      <h1 style="font-family:'Cormorant Garamond',serif;font-weight:300;font-style:italic;font-size:36px;line-height:1.05;color:#F0EDE8;margin:0;">
        ${orderNum} <em style="color:#ABA9A4;">·</em> ${data.total.toFixed(2).replace('.', ',')}€
      </h1>
    </td></tr>

    <tr><td style="padding:0 24px;">
      <p style="font-family:'Geist',sans-serif;font-size:10px;font-weight:300;letter-spacing:0.28em;text-transform:uppercase;color:#7A7872;margin:0 0 8px;">Client</p>
      <p style="font-family:'Geist',sans-serif;font-size:14px;font-weight:300;line-height:1.7;color:#D8D4CE;margin:0 0 28px;">
        ${data.customerName}<br>
        <a href="mailto:${data.customerEmail}" style="color:#F0EDE8;text-decoration:none;border-bottom:0.5px solid #7A7872;">${data.customerEmail}</a>
      </p>

      <p style="font-family:'Geist',sans-serif;font-size:10px;font-weight:300;letter-spacing:0.28em;text-transform:uppercase;color:#7A7872;margin:0 0 8px;">Adresse</p>
      <p style="font-family:'Geist',sans-serif;font-size:13px;font-weight:300;line-height:1.7;color:#D8D4CE;margin:0 0 28px;">
        ${addrLines}
      </p>

      <p style="font-family:'Geist',sans-serif;font-size:10px;font-weight:300;letter-spacing:0.28em;text-transform:uppercase;color:#7A7872;margin:0 0 8px;">Articles</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:0.5px solid rgba(240,237,232,0.08);">
        ${itemsRows}
      </table>
    </td></tr>

    <tr><td align="center" style="padding:40px 24px 24px;">
      <a href="${storeConfig.adminDashboardUrl}" style="display:inline-block;background:#F0EDE8;color:#0E0E0C;font-family:'Geist',sans-serif;font-size:11px;font-weight:400;letter-spacing:0.2em;text-transform:uppercase;padding:18px 36px;border-radius:2px;text-decoration:none;">
        Ouvrir le back-office →
      </a>
    </td></tr>

    <tr><td align="center" style="padding:32px 24px 0;border-top:0.5px solid rgba(240,237,232,0.08);">
      <p style="font-family:'Geist',sans-serif;font-size:9px;font-weight:300;letter-spacing:0.15em;text-transform:uppercase;color:rgba(240,237,232,0.2);margin:0;">
        TrailFlow Admin · Notification automatique
      </p>
    </td></tr>
  </table>
</td></tr>
</table>
</body></html>`,
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
      const result = await this.send({
        from: this.from,
        to: data.customerEmail,
        subject: `Votre commande #${orderNum} a ete expediee !`,
        html: shippingNotificationTemplate(data, storeInfo),
      });
      this.logger.log(`Shipping notification sent to ${data.customerEmail} (${result.id})`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send shipping notification to ${data.customerEmail}`, error);
    }
  }
}
