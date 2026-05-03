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

  // Upsell flasques 500ml (cf. todo moyen terme — bundle prêt)
  const flasques = await prisma.product.upsert({
    where: { slug: 'flasques-500ml' },
    update: { name: 'Pack 2 flasques 500ml', images: ['/images/flasques.png'] },
    create: {
      name: 'Pack 2 flasques 500ml',
      slug: 'flasques-500ml',
      description: 'Pack de 2 flasques souples 500ml compatibles avec les poches avant du gilet.',
      price: 7.9,
      costPrice: 2.5,
      images: ['/images/flasques.png'],
      active: false, // vendues uniquement en bundle pour l'instant
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
    items: { productId: string; quantity: number }[];
  }) {
    const bundle = await prisma.bundle.upsert({
      where: { slug: data.slug },
      update: {
        label: data.label,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        badge: data.badge,
        position: data.position,
      },
      create: {
        slug: data.slug,
        label: data.label,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        badge: data.badge,
        position: data.position,
        active: true,
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

  // Upsell pack hydratation : gilet + flasques
  await upsertBundle({
    slug: 'pack-hydratation',
    label: 'Pack Hydratation',
    description: 'Gilet TrailFlow + 2 flasques 500ml',
    price: 39.9,
    comparePrice: 57.8,
    badge: '-31%',
    position: 1,
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
