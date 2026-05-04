/**
 * URL "publique" du store (utilisée dans les liens d'emails et magic links de
 * suivi de commande). En dev on tombe sur FRONTEND_URL — typiquement
 * http://localhost:3000 — pour que les boutons "Suivre ma commande" envoient
 * le testeur sur sa stack locale plutôt que sur la prod.
 */
function resolvePublicStoreUrl(): string {
  const explicit = process.env.STORE_URL;
  const isProd = process.env.NODE_ENV === 'production';

  // En prod : on exige STORE_URL pour ne jamais leak un FRONTEND_URL local.
  if (isProd && explicit) return explicit.replace(/\/+$/, '');

  // En dev : FRONTEND_URL prime, sinon localhost. STORE_URL en dev est ignoré
  // pour éviter que les emails MailHog renvoient sur le domaine de prod.
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  return frontend.replace(/\/+$/, '');
}

const publicStoreUrl = resolvePublicStoreUrl();

export const storeConfig = {
  storeName: process.env.STORE_NAME || 'MON STORE',
  storeUrl: publicStoreUrl,
  contactEmail: process.env.CONTACT_EMAIL || 'contact@monstore.shop',
  orderPrefix: process.env.ORDER_PREFIX || 'MS',
  emailFrom: process.env.EMAIL_FROM || `${process.env.STORE_NAME || 'MON STORE'} <onboarding@resend.dev>`,
  adminDashboardUrl: `${publicStoreUrl}/admin/orders`,
  trackingPageUrl: `${publicStoreUrl}/suivi`,
};

export function formatOrderNumber(orderNumber: number): string {
  return `${storeConfig.orderPrefix}-${String(orderNumber).padStart(5, '0')}`;
}
