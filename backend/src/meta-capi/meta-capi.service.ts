import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

/**
 * Meta Conversions API — envoi server-side du Purchase event.
 *
 * Pourquoi : iOS 14.5+ (ATT) et les ad-blockers cassent 30-50 % du signal
 * Pixel client. CAPI est immune à ça (POST direct backend → Meta Graph API).
 *
 * Dédoublonnage : on partage un `event_id` entre le client (passé via
 * `fbq('track', 'Purchase', {...}, { eventID })`) et le server (envoyé dans
 * `data[].event_id`). Meta dédupe sur cette clé.
 *
 * Si `META_CAPI_ACCESS_TOKEN` ou `META_PIXEL_ID` est absent, la classe est
 * un no-op silencieux (utile en dev sans avoir à câbler le token).
 */
@Injectable()
export class MetaCapiService {
  private readonly logger = new Logger(MetaCapiService.name);
  private readonly pixelId: string | undefined;
  private readonly accessToken: string | undefined;
  private readonly testEventCode: string | undefined;
  private readonly apiVersion = 'v19.0';

  constructor(private config: ConfigService) {
    this.pixelId = this.config.get<string>('META_PIXEL_ID');
    this.accessToken = this.config.get<string>('META_CAPI_ACCESS_TOKEN');
    this.testEventCode = this.config.get<string>('META_CAPI_TEST_EVENT_CODE');
  }

  isConfigured(): boolean {
    return !!(this.pixelId && this.accessToken);
  }

  async sendPurchase(input: {
    eventId: string;
    eventTime?: number;
    eventSourceUrl?: string;
    user: {
      email: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
      city?: string;
      postalCode?: string;
      country?: string;
      fbp?: string;
      fbc?: string;
      clientIp?: string;
      clientUserAgent?: string;
    };
    customData: {
      value: number;
      currency: string;
      contentIds: string[];
      contents: { id: string; quantity: number; item_price: number }[];
      numItems: number;
      orderId?: string;
    };
  }): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.debug('Meta CAPI non configuré (META_PIXEL_ID/ACCESS_TOKEN absents) — skip');
      return;
    }

    // En dev/preview, on ne pousse pas les events vers Meta : évite de polluer
    // les stats du Pixel prod avec les Purchase de test (et de fausser le CPA).
    // Bypass possible via META_CAPI_TEST_EVENT_CODE — dans ce cas les events
    // partent mais arrivent dans l'onglet "Test Events" du gestionnaire Meta.
    if (process.env.NODE_ENV !== 'production' && !this.testEventCode) {
      this.logger.debug(`Meta CAPI skip — NODE_ENV=${process.env.NODE_ENV ?? 'undefined'} (set META_CAPI_TEST_EVENT_CODE pour tester)`);
      return;
    }

    // Hash SHA-256 obligatoire pour les PII selon les specs Meta CAPI.
    const hash = (v?: string) => (v ? createHash('sha256').update(v.trim().toLowerCase()).digest('hex') : undefined);
    const hashPhone = (v?: string) => (v ? createHash('sha256').update(v.replace(/\D/g, '')).digest('hex') : undefined);

    // Découpe "Prénom Nom" → first/last si non fournis explicitement.
    const fn = input.user.firstName ?? input.user.email.split('@')[0];
    const ln = input.user.lastName;

    const event = {
      event_name: 'Purchase',
      event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
      event_id: input.eventId,
      action_source: 'website',
      event_source_url: input.eventSourceUrl,
      user_data: {
        em: hash(input.user.email),
        ph: hashPhone(input.user.phone),
        fn: hash(fn),
        ln: hash(ln),
        ct: hash(input.user.city),
        zp: hash(input.user.postalCode),
        country: hash(input.user.country),
        fbp: input.user.fbp || undefined,
        fbc: input.user.fbc || undefined,
        client_ip_address: input.user.clientIp || undefined,
        client_user_agent: input.user.clientUserAgent || undefined,
      },
      custom_data: {
        currency: input.customData.currency,
        value: input.customData.value,
        content_type: 'product',
        content_ids: input.customData.contentIds,
        contents: input.customData.contents,
        num_items: input.customData.numItems,
        order_id: input.customData.orderId,
      },
    };

    const payload: Record<string, unknown> = { data: [event] };
    if (this.testEventCode) {
      payload.test_event_code = this.testEventCode;
    }

    const url = `https://graph.facebook.com/${this.apiVersion}/${this.pixelId}/events?access_token=${encodeURIComponent(this.accessToken!)}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        this.logger.error(`Meta CAPI Purchase échec ${res.status}: ${text}`);
        return;
      }
      const json = await res.json();
      this.logger.log(`Meta CAPI Purchase OK — event_id=${input.eventId} fbtrace_id=${json?.fbtrace_id ?? '?'}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // Ne jamais throw depuis ici — un échec CAPI ne doit pas bloquer le webhook.
      this.logger.error(`Meta CAPI Purchase exception: ${msg}`);
    }
  }
}
