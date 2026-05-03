import type { OrderEmailData } from '../email.service';

export interface StoreInfo {
  storeName: string;
  storeUrl: string;
  orderNum: string;
}

const C = {
  ink: '#0E0E0C',
  inkSoft: '#1C1C1A',
  cream: '#F0EDE8',
  creamDk: '#D8D4CE',
  muted: '#7A7872',
  mutedLt: '#ABA9A4',
  green: '#2A7A5A',
  border: 'rgba(240,237,232,0.08)',
};

const FONTS = `'Cormorant Garamond', 'Times New Roman', serif`;
const SANS = `'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;

export function orderConfirmationTemplate(
  data: OrderEmailData,
  store: StoreInfo,
): string {
  const { orderNum, storeUrl } = store;
  const addr = data.shippingAddress;
  const trackingHref = data.trackingMagicLink || `${storeUrl}/suivi`;

  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:18px 0;border-bottom:0.5px solid ${C.border};font-family:${SANS};font-size:14px;font-weight:300;color:${C.creamDk};">
        ${item.name}
        <div style="font-family:${SANS};font-size:11px;font-weight:300;letter-spacing:0.18em;text-transform:uppercase;color:${C.muted};margin-top:4px;">
          Quantité ${item.quantity}
        </div>
      </td>
      <td align="right" style="padding:18px 0;border-bottom:0.5px solid ${C.border};font-family:${FONTS};font-weight:400;font-size:18px;color:${C.cream};letter-spacing:0.02em;">
        ${(item.price * item.quantity).toFixed(2).replace('.', ',')}€
      </td>
    </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Commande confirmée</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Geist:wght@200;300;400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${C.ink};color:${C.cream};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;">
    Commande ${orderNum} confirmée — TrailFlow
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${C.ink};">
    <tr>
      <td align="center" style="padding:48px 16px;">

        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:${C.ink};">

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding:0 0 40px;">
              <a href="${storeUrl}" style="font-family:${FONTS};font-weight:300;font-size:22px;letter-spacing:0.22em;text-transform:uppercase;color:${C.cream};text-decoration:none;">
                Trail<span style="color:${C.muted};">Flow</span>
              </a>
            </td>
          </tr>

          <!-- BADGE -->
          <tr>
            <td align="center" style="padding:0 0 24px;">
              <span style="display:inline-block;font-family:${SANS};font-size:10px;font-weight:400;letter-spacing:0.28em;text-transform:uppercase;color:${C.green};border:0.5px solid rgba(42,122,90,0.4);padding:8px 16px;border-radius:999px;">
                ✓ Commande confirmée
              </span>
            </td>
          </tr>

          <!-- H1 -->
          <tr>
            <td align="center" style="padding:0 24px 16px;">
              <h1 style="font-family:${FONTS};font-weight:300;font-style:italic;font-size:44px;line-height:1.05;letter-spacing:-0.01em;color:${C.cream};margin:0;">
                Merci ${data.customerName.split(' ')[0]},<br>
                <em style="color:${C.mutedLt};">on est sur le coup.</em>
              </h1>
            </td>
          </tr>

          <!-- Sub -->
          <tr>
            <td align="center" style="padding:0 24px 40px;">
              <p style="font-family:${SANS};font-size:14px;font-weight:300;line-height:1.8;color:${C.mutedLt};max-width:420px;margin:0 auto;">
                Ta commande <strong style="color:${C.cream};font-weight:400;">${orderNum}</strong> est entre nos mains.
                Expédition sous 24h, livraison Colissimo 5–7 jours ouvrés.
              </p>
            </td>
          </tr>

          <!-- CTA principal magic link -->
          <tr>
            <td align="center" style="padding:0 24px 48px;">
              <a href="${trackingHref}" style="display:inline-block;background:${C.cream};color:${C.ink};font-family:${SANS};font-size:11px;font-weight:400;letter-spacing:0.2em;text-transform:uppercase;padding:18px 36px;border-radius:2px;text-decoration:none;">
                Suivre ma commande →
              </a>
              <p style="font-family:${SANS};font-size:10px;font-weight:300;letter-spacing:0.04em;color:${C.muted};margin:14px 0 0;">
                Lien personnel · pas de mot de passe à retenir
              </p>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:0 24px;">
              <p style="font-family:${SANS};font-size:10px;font-weight:300;letter-spacing:0.28em;text-transform:uppercase;color:${C.muted};margin:0 0 8px;">
                Récapitulatif
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:0.5px solid ${C.border};">
                ${itemsHtml}
                <tr>
                  <td style="padding:24px 0 0;font-family:${SANS};font-size:11px;font-weight:300;letter-spacing:0.22em;text-transform:uppercase;color:${C.muted};">
                    Total payé
                  </td>
                  <td align="right" style="padding:24px 0 0;font-family:${FONTS};font-weight:400;font-size:32px;color:${C.cream};letter-spacing:0.02em;">
                    ${data.total.toFixed(2).replace('.', ',')}€
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="padding:48px 0 0;"></td></tr>

          <!-- Adresse de livraison -->
          <tr>
            <td style="padding:0 24px;">
              <p style="font-family:${SANS};font-size:10px;font-weight:300;letter-spacing:0.28em;text-transform:uppercase;color:${C.muted};margin:0 0 12px;">
                Adresse de livraison
              </p>
              <p style="font-family:${SANS};font-size:13px;font-weight:300;line-height:1.7;color:${C.creamDk};margin:0;">
                ${data.customerName}<br>
                ${addr.line1}${addr.line2 ? '<br>' + addr.line2 : ''}<br>
                ${addr.postalCode} ${addr.city}<br>
                ${addr.country || 'France'}
              </p>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="padding:48px 0 0;border-top:0.5px solid ${C.border};margin-top:48px;"></td></tr>

          <!-- Trust strip -->
          <tr>
            <td align="center" style="padding:32px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:0 14px;font-family:${SANS};font-size:10px;font-weight:300;letter-spacing:0.18em;text-transform:uppercase;color:${C.muted};">
                    · Paiement sécurisé
                  </td>
                  <td style="padding:0 14px;font-family:${SANS};font-size:10px;font-weight:300;letter-spacing:0.18em;text-transform:uppercase;color:${C.muted};">
                    · Retour 15j gratuit
                  </td>
                  <td style="padding:0 14px;font-family:${SANS};font-size:10px;font-weight:300;letter-spacing:0.18em;text-transform:uppercase;color:${C.muted};">
                    · Stripe
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:32px 24px 0;border-top:0.5px solid ${C.border};">
              <p style="font-family:${FONTS};font-weight:300;font-size:18px;letter-spacing:0.22em;text-transform:uppercase;color:${C.muted};margin:0 0 14px;">
                TrailFlow
              </p>
              <p style="font-family:${SANS};font-size:10px;font-weight:300;letter-spacing:0.15em;color:rgba(240,237,232,0.25);margin:0;">
                Une question ? <a href="mailto:contact@trailflow.boutique" style="color:${C.muted};text-decoration:none;border-bottom:0.5px solid ${C.muted};">contact@trailflow.boutique</a>
              </p>
              <p style="font-family:${SANS};font-size:9px;font-weight:300;letter-spacing:0.15em;text-transform:uppercase;color:rgba(240,237,232,0.15);margin:24px 0 0;">
                © 2026 TrailFlow · Site conçu par <a href="https://www.nmf-agence.com/" style="color:rgba(240,237,232,0.3);text-decoration:none;">NMF Agence</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
