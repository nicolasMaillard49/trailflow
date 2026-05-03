export const storeConfig = {
  storeName: process.env.STORE_NAME || 'MON STORE',
  storeUrl: process.env.STORE_URL || 'https://monstore.shop',
  contactEmail: process.env.CONTACT_EMAIL || 'contact@monstore.shop',
  orderPrefix: process.env.ORDER_PREFIX || 'MS',
  emailFrom: process.env.EMAIL_FROM || `${process.env.STORE_NAME || 'MON STORE'} <onboarding@resend.dev>`,
  adminDashboardUrl: `${process.env.STORE_URL || 'https://monstore.shop'}/admin/orders`,
  trackingPageUrl: `${process.env.STORE_URL || 'https://monstore.shop'}/suivi`,
}

export function formatOrderNumber(orderNumber: number): string {
  return `${storeConfig.orderPrefix}-${String(orderNumber).padStart(5, '0')}`
}
