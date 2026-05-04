/**
 * Validateurs runtime pour les réponses API critiques (paiement, produit).
 *
 * Pas de Zod : on n'avait besoin que d'un sous-ensemble de garde-fous, et
 * importer une lib de 60ko sur un site mono-produit n'en valait pas le coût.
 * Si la liste de schémas grossit, basculer vers Zod sera trivial — chaque
 * `parseX` retourne déjà la donnée validée typée.
 */

class SchemaError extends Error {
  constructor(message: string) {
    super(`[schema] ${message}`);
  }
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown, path: string): string {
  if (typeof v !== "string") throw new SchemaError(`${path}: expected string, got ${typeof v}`);
  return v;
}

function num(v: unknown, path: string): number {
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new SchemaError(`${path}: expected finite number, got ${typeof v}`);
  }
  return v;
}

function optStr(v: unknown, path: string): string | undefined {
  if (v === undefined || v === null) return undefined;
  return str(v, path);
}

function optNum(v: unknown, path: string): number | undefined {
  if (v === undefined || v === null) return undefined;
  return num(v, path);
}

function arr<T>(v: unknown, path: string, parseItem: (x: unknown, p: string) => T): T[] {
  if (!Array.isArray(v)) throw new SchemaError(`${path}: expected array`);
  return v.map((item, i) => parseItem(item, `${path}[${i}]`));
}

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
};

export function parseProduct(raw: unknown): Product {
  if (!isObj(raw)) throw new SchemaError("product: expected object");
  return {
    id: str(raw.id, "product.id"),
    slug: str(raw.slug, "product.slug"),
    name: str(raw.name, "product.name"),
    description: str(raw.description, "product.description"),
    price: num(raw.price, "product.price"),
    comparePrice: raw.comparePrice == null ? null : num(raw.comparePrice, "product.comparePrice"),
    images: arr(raw.images ?? [], "product.images", (x, p) => str(x, p)),
  };
}

export type SessionStatus = {
  session: {
    id: string;
    status?: string;
    payment_status?: string;
    customer_details?: { email?: string };
    amount_total?: number;
  };
  order: {
    id: string;
    orderRef: string;
    orderNumber: number;
    customerEmail: string;
    customerName: string;
    total: number;
    status: string;
    trackingMagicLink: string;
    items: { name: string; quantity: number; price: number }[];
  } | null;
};

export function parseSessionStatus(raw: unknown): SessionStatus {
  if (!isObj(raw)) throw new SchemaError("session-status: expected object");

  const sRaw = raw.session;
  if (!isObj(sRaw)) throw new SchemaError("session-status.session: expected object");
  const session: SessionStatus["session"] = {
    id: str(sRaw.id, "session.id"),
    status: optStr(sRaw.status, "session.status"),
    payment_status: optStr(sRaw.payment_status, "session.payment_status"),
    amount_total: optNum(sRaw.amount_total, "session.amount_total"),
    customer_details: isObj(sRaw.customer_details)
      ? { email: optStr(sRaw.customer_details.email, "session.customer_details.email") }
      : undefined,
  };

  let order: SessionStatus["order"] = null;
  if (raw.order != null) {
    if (!isObj(raw.order)) throw new SchemaError("session-status.order: expected object or null");
    const o = raw.order;
    order = {
      id: str(o.id, "order.id"),
      orderRef: str(o.orderRef, "order.orderRef"),
      orderNumber: num(o.orderNumber, "order.orderNumber"),
      customerEmail: str(o.customerEmail, "order.customerEmail"),
      customerName: str(o.customerName, "order.customerName"),
      total: num(o.total, "order.total"),
      status: str(o.status, "order.status"),
      trackingMagicLink: str(o.trackingMagicLink, "order.trackingMagicLink"),
      items: arr(o.items ?? [], "order.items", (x, p) => {
        if (!isObj(x)) throw new SchemaError(`${p}: expected object`);
        return {
          name: str(x.name, `${p}.name`),
          quantity: num(x.quantity, `${p}.quantity`),
          price: num(x.price, `${p}.price`),
        };
      }),
    };
  }

  return { session, order };
}

export type CheckoutCreate = { sessionId: string; clientSecret: string };

export function parseCheckoutCreate(raw: unknown): CheckoutCreate {
  if (!isObj(raw)) throw new SchemaError("checkout: expected object");
  return {
    sessionId: str(raw.sessionId, "checkout.sessionId"),
    clientSecret: str(raw.clientSecret, "checkout.clientSecret"),
  };
}
