import type { OrderEmailData } from '../email.service';

export interface StoreInfo {
  storeName: string;
  storeUrl: string;
  orderNum: string;
}

export function orderConfirmationTemplate(data: OrderEmailData, store: StoreInfo): string {
  const { orderNum, storeName, storeUrl } = store;
  const addr = data.shippingAddress;

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
          <strong style="color: #111827;">${item.name}</strong>
          <br><span style="color: #6b7280; font-size: 14px;">Quantite: ${item.quantity}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827; font-weight: 600;">
          ${(item.price * item.quantity).toFixed(2).replace('.', ',')} &euro;
        </td>
      </tr>`,
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #059669, #10b981); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Merci pour votre commande !</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 16px;">Commande ${orderNum}</p>
    </div>

    <!-- Body -->
    <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px;">
      <p style="color: #374151; font-size: 16px; margin-top: 0;">
        Bonjour <strong>${data.customerName}</strong>,
      </p>
      <p style="color: #6b7280; font-size: 15px;">
        Votre commande a bien ete recue et confirmee. Voici le recapitulatif :
      </p>

      <!-- Items -->
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        ${itemsHtml}
        <tr>
          <td style="padding: 16px 0; font-size: 18px; font-weight: 700; color: #111827;">Total</td>
          <td style="padding: 16px 0; font-size: 18px; font-weight: 700; color: #059669; text-align: right;">
            ${data.total.toFixed(2).replace('.', ',')} &euro;
          </td>
        </tr>
      </table>

      <!-- Shipping address -->
      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
          Adresse de livraison
        </p>
        <p style="margin: 0; color: #6b7280; font-size: 15px; line-height: 1.6;">
          ${data.customerName}<br>
          ${addr.line1}<br>
          ${addr.line2 ? addr.line2 + '<br>' : ''}
          ${addr.postalCode} ${addr.city}<br>
          France
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin: 32px 0 16px;">
        <a href="${storeUrl}/suivi?order=${data.orderNumber}"
           style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Suivre ma commande
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 13px; text-align: center; margin: 24px 0 0;">
        Vous recevrez un email avec le numero de suivi des que votre commande sera expediee.
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
