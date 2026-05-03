import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BundlesService } from './bundles.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BundlesService', () => {
  let service: BundlesService;
  let prisma: {
    bundle: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    bundleItem: { deleteMany: jest.Mock; create: jest.Mock };
  };

  const mockBundle = {
    id: 'bundle-1',
    slug: 'sport',
    label: 'Sport',
    price: 34.99,
    active: true,
    position: 1,
    items: [
      { id: 'bi-1', productId: 'prod-1', quantity: 1, product: { id: 'prod-1', name: 'Mon Produit' } },
      { id: 'bi-2', productId: 'prod-2', quantity: 1, product: { id: 'prod-2', name: 'Shaker' } },
    ],
  };

  beforeEach(async () => {
    prisma = {
      bundle: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      bundleItem: { deleteMany: jest.fn(), create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BundlesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(BundlesService);
  });

  describe('findActive', () => {
    it('should return only active bundles ordered by position', async () => {
      prisma.bundle.findMany.mockResolvedValue([mockBundle]);

      const result = await service.findActive();

      expect(prisma.bundle.findMany).toHaveBeenCalledWith({
        where: { active: true },
        orderBy: { position: 'asc' },
        include: { items: { include: { product: true } } },
      });
      expect(result).toEqual([mockBundle]);
    });
  });

  describe('findAll', () => {
    it('should return all bundles ordered by position', async () => {
      prisma.bundle.findMany.mockResolvedValue([mockBundle]);

      const result = await service.findAll();

      expect(prisma.bundle.findMany).toHaveBeenCalledWith({
        orderBy: { position: 'asc' },
        include: { items: { include: { product: true } } },
      });
      expect(result).toEqual([mockBundle]);
    });
  });

  describe('findById', () => {
    it('should return bundle by id', async () => {
      prisma.bundle.findUnique.mockResolvedValue(mockBundle);

      const result = await service.findById('bundle-1');

      expect(result).toEqual(mockBundle);
    });

    it('should throw NotFoundException when bundle not found', async () => {
      prisma.bundle.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a bundle with items', async () => {
      prisma.bundle.create.mockResolvedValue(mockBundle);

      const result = await service.create({
        slug: 'sport',
        label: 'Sport',
        price: 34.99,
        items: [
          { productId: 'prod-1', quantity: 1 },
          { productId: 'prod-2', quantity: 1 },
        ],
      });

      expect(prisma.bundle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'sport',
            label: 'Sport',
            price: 34.99,
          }),
        }),
      );
      expect(result).toEqual(mockBundle);
    });
  });

  describe('remove', () => {
    it('should delete an existing bundle', async () => {
      prisma.bundle.findUnique.mockResolvedValue(mockBundle);
      prisma.bundle.delete.mockResolvedValue(mockBundle);

      await service.remove('bundle-1');

      expect(prisma.bundle.delete).toHaveBeenCalledWith({ where: { id: 'bundle-1' } });
    });

    it('should throw NotFoundException for nonexistent bundle', async () => {
      prisma.bundle.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
