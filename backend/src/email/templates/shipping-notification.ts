import type { ShippingEmailData } from '../email.service';
import type { StoreInfo } from './order-confirmation';

export function shippingNotificationTemplate(data: ShippingEmailData, store: StoreInfo): string {
  const { orderNum, storeName, storeUrl } = store;
  const trackingLink = data.trackingUrl
    ? `<a href="${data.trackingUrl}" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">Suivre mon colis</a>`
    : `<p style="background: #f9fafb; border-radius: 12px; padding: 16px; text-align: center; font-family: monospace; font-size: 18px; color: #111827; letter-spacing: 0.05em;">${data.trackingNumber}</p>`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #059669, #10b981); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 8px;">📦</div>
      <h1 style="color: white; margin: 0; font-size: 24px;">Votre commande est en route !</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 16px;">Commande ${orderNum}</p>
    </div>

    <!-- Body -->
    <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px;">
      <p style="color: #374151; font-size: 16px; margin-top: 0;">
        Bonjour <strong>${data.customerName}</strong>,
      </p>
      <p style="color: #6b7280; font-size: 15px;">
        Bonne nouvelle ! Votre commande <strong>${orderNum}</strong> a ete expediee.
      </p>

      ${data.trackingNumber ? `
      <!-- Tracking -->
      <div style="margin: 28px 0;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
          Numero de suivi
        </p>
        <p style="background: #f9fafb; border-radius: 12px; padding: 16px; text-align: center; font-family: monospace; font-size: 18px; color: #111827; letter-spacing: 0.05em; margin: 0;">
          ${data.trackingNumber}
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin: 32px 0 16px;">
        ${trackingLink}
      </div>
      ` : `
      <p style="color: #6b7280; font-size: 15px;">
        Vous recevrez votre numero de suivi par email tres prochainement.
      </p>
      `}

      <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 24px 0 0;">
        Delai de livraison estime : 5 a 7 jours ouvrables.
        <br>Vous pouvez aussi suivre votre commande sur
        <a href="${storeUrl}/suivi?order=${data.orderNumber}" style="color: #10b981;">${storeUrl.replace(/^https?:\/\//, '')}/suivi</a>.
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">${storeName}</p>
      <p style="margin: 4px 0 0;">
        <a href="${storeUrl}" style="color: #10b981; text-decoration: none;">${storeUrl.replace(/^https?:\/\//, '')}</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}
