import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({ where: { active: true } });
  }

  async findBySlug(slug: string) {
    return this.prisma.product.findUnique({ where: { slug } });
  }

  async findById(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return this.prisma.product.update({ where: { id }, data });
  }
}
