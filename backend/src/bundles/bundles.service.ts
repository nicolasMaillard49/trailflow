import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBundleDto } from './dto/create-bundle.dto';
import { UpdateBundleDto } from './dto/update-bundle.dto';

const BUNDLE_INCLUDE = {
  items: { include: { product: true } },
} as const;

@Injectable()
export class BundlesService {
  constructor(private prisma: PrismaService) {}

  async findActive() {
    return this.prisma.bundle.findMany({
      where: { active: true },
      orderBy: { position: 'asc' },
      include: BUNDLE_INCLUDE,
    });
  }

  async findAll() {
    return this.prisma.bundle.findMany({
      orderBy: { position: 'asc' },
      include: BUNDLE_INCLUDE,
    });
  }

  async findById(id: string) {
    const bundle = await this.prisma.bundle.findUnique({
      where: { id },
      include: BUNDLE_INCLUDE,
    });
    if (!bundle) throw new NotFoundException('Bundle not found');
    return bundle;
  }

  async create(dto: CreateBundleDto) {
    return this.prisma.bundle.create({
      data: {
        slug: dto.slug,
        label: dto.label,
        description: dto.description || '',
        price: dto.price,
        comparePrice: dto.comparePrice ?? null,
        badge: dto.badge ?? null,
        position: dto.position ?? 0,
        active: dto.active ?? true,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: BUNDLE_INCLUDE,
    });
  }

  async update(id: string, dto: UpdateBundleDto) {
    await this.findById(id);

    const { items, ...data } = dto;

    const bundle = await this.prisma.bundle.update({
      where: { id },
      data,
      include: BUNDLE_INCLUDE,
    });

    if (items) {
      await this.prisma.bundleItem.deleteMany({ where: { bundleId: id } });
      await Promise.all(
        items.map((item) =>
          this.prisma.bundleItem.create({
            data: { bundleId: id, productId: item.productId, quantity: item.quantity },
          }),
        ),
      );
      return this.findById(id);
    }

    return bundle;
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.bundle.delete({ where: { id } });
  }
}
