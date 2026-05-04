import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import * as bcrypt from 'bcrypt';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5433/trailflow_dev';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // TrailFlow — gilet hydratation trail & running
  const product = await prisma.product.upsert({
    where: { slug: 'gilet-trailflow' },
    update: {
      name: 'Gilet TrailFlow',
      images: [
        '/images/product-face.png',
        '/images/product-face-sol.png',
        '/images/product-3quart.png',
        '/images/product-cote-droit.png',
        '/images/product-dos.png',
        '/images/product-cote-gauche.png',
        '/images/product-details.png',
      ],
      stripeImage: '/images/product-face.png',
    },
    create: {
      name: 'Gilet TrailFlow',
      slug: 'gilet-trailflow',
      description:
        'Gilet d\'hydratation trail & running — mesh réfléchissant 360°, 2 poches avant flasques, 1 poche zippée téléphone, poche zippée dos, boucles click anti-ballottement.',
      price: 34.9,
      comparePrice: 49.9,
      costPrice: 7.79,
      images: [
        '/images/product-face.png',
        '/images/product-face-sol.png',
        '/images/product-3quart.png',
        '/images/product-cote-droit.png',
        '/images/product-dos.png',
        '/images/product-cote-gauche.png',
        '/images/product-details.png',
      ],
      stripeImage: '/images/product-face.png',
      variants: {
        sizes: [
          { name: 'S', value: 's' },
          { name: 'M', value: 'm' },
          { name: 'L', value: 'l' },
          { name: 'XL', value: 'xl' },
        ],
      },
      supplierUrl: 'https://www.aliexpress.com/item/1005010186203421.html',
      active: true,
    },
  });

  // Upsell flasques 500ml — exposé en add-on cochable sur /produit
  const flasques = await prisma.product.upsert({
    where: { slug: 'flasques-500ml' },
    update: {
      name: 'Pack 2 flasques 500ml',
      price: 15,
      costPrice: 3.5,
      images: ['/images/flasks/pack-2-flasks.png'],
      stripeImage: '/images/flasks/pack-2-flasks.png',
      active: true,
    },
    create: {
      name: 'Pack 2 flasques 500ml',
      slug: 'flasques-500ml',
      description: 'Pack de 2 flasques souples 500ml compatibles avec les poches avant du gilet. Bouchon push-pull, dragonne intégrée.',
      price: 15,
      costPrice: 3.5,
      images: ['/images/flasks/pack-2-flasks.png'],
      stripeImage: '/images/flasks/pack-2-flasks.png',
      active: true,
    },
  });

  async function upsertBundle(data: {
    slug: string;
    label: string;
    description: string;
    price: number;
    comparePrice: number | null;
    badge: string | null;
    position: number;
    active?: boolean;
    items: { productId: string; quantity: number }[];
  }) {
    const active = data.active ?? true;
    const bundle = await prisma.bundle.upsert({
      where: { slug: data.slug },
      update: {
        label: data.label,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        badge: data.badge,
        position: data.position,
        active,
      },
      create: {
        slug: data.slug,
        label: data.label,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        badge: data.badge,
        position: data.position,
        active,
      },
    });

    await prisma.bundleItem.deleteMany({ where: { bundleId: bundle.id } });
    for (const item of data.items) {
      await prisma.bundleItem.create({
        data: {
          bundleId: bundle.id,
          productId: item.productId,
          quantity: item.quantity,
        },
      });
    }
    return bundle;
  }

  // Pack hydratation : conservé en BDD pour l'historique mais désactivé.
  // Les flasques sont désormais vendues en add-on cochable sur /produit
  // (gilet 34.90 + flasques 15 = 49.90). Garder ce bundle actif créerait
  // un trou tarifaire (achat API direct à 39.90€).
  await upsertBundle({
    slug: 'pack-hydratation',
    label: 'Pack Hydratation',
    description: 'Gilet TrailFlow + 2 flasques 500ml',
    price: 39.9,
    comparePrice: 57.8,
    badge: '-31%',
    position: 1,
    active: false,
    items: [
      { productId: product.id, quantity: 1 },
      { productId: flasques.id, quantity: 1 },
    ],
  });

  // Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@trailflow.shop';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
    },
  });

  console.log(`Seed TrailFlow OK — admin: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
