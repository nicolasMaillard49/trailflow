import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: {
    product: { findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      product: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  describe('findAll', () => {
    it('should return active products', async () => {
      const products = [
        { id: '1', name: 'Product 1', active: true },
        { id: '2', name: 'Product 2', active: true },
      ];
      prisma.product.findMany.mockResolvedValue(products);

      const result = await service.findAll();

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { active: true },
      });
      expect(result).toEqual(products);
    });
  });

  describe('findBySlug', () => {
    it('should return product by slug', async () => {
      const product = { id: '1', slug: 'test-product', name: 'Test' };
      prisma.product.findUnique.mockResolvedValue(product);

      const result = await service.findBySlug('test-product');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-product' },
      });
      expect(result).toEqual(product);
    });

    it('should return null for non-existent slug', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      const result = await service.findBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return product by ID', async () => {
      const product = { id: 'prod-1', name: 'Test Product' };
      prisma.product.findUnique.mockResolvedValue(product);

      const result = await service.findById('prod-1');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
      });
      expect(result).toEqual(product);
    });

    it('should return null for non-existent ID', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll — edge cases', () => {
    it('should return empty array when no active products', async () => {
      prisma.product.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });
});
