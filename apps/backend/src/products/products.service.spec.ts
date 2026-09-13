import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

describe('ProductsService', () => {
  let prisma: PrismaMock;
  let service: ProductsService;

  const baseDto = {
    name: 'RTX 5070',
    description: 'A great GPU',
    price: 100000,
    stock: 5,
    sku: 'GPU-001',
    categoryId: 'cat-1',
  };

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new ProductsService(prisma as any);
    prisma.category.findUnique.mockResolvedValue({ id: 'cat-1', name: 'GPUs' });
  });

  describe('create', () => {
    it('rejects a duplicate slug', async () => {
      prisma.product.findUnique.mockImplementation(({ where }: any) =>
        where.slug ? { id: 'existing', slug: where.slug } : null,
      );
      await expect(service.create(baseDto as any)).rejects.toThrow(ConflictException);
    });

    it('rejects a duplicate SKU', async () => {
      prisma.product.findUnique.mockImplementation(({ where }: any) =>
        where.sku ? { id: 'existing', sku: where.sku } : null,
      );
      await expect(service.create(baseDto as any)).rejects.toThrow(ConflictException);
    });

    it('rejects an unknown category', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.category.findUnique.mockResolvedValue(null);
      await expect(service.create(baseDto as any)).rejects.toThrow(NotFoundException);
    });

    it('creates a product with a slugified name when no slug is given', async () => {
      prisma.product.findUnique.mockResolvedValue(null);
      prisma.product.create.mockImplementation(({ data }: any) => ({ id: 'p1', ...data }));

      const result = await service.create(baseDto as any);

      expect(result.slug).toBe('rtx-5070');
      expect(prisma.product.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns an empty page for an unknown category slug (never leaks the full catalog)', async () => {
      prisma.category.findUnique.mockResolvedValue(null); // slug lookup for filter
      const result = await service.findAll({ category: 'not-a-real-category' } as any, false);
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(prisma.product.findMany).not.toHaveBeenCalled();
    });

    it('forces isActive=true for non-admin callers regardless of includeInactive', async () => {
      prisma.product.findMany.mockResolvedValue([]);
      prisma.product.count.mockResolvedValue(0);

      await service.findAll({ includeInactive: true } as any, false);

      const whereArg = prisma.product.findMany.mock.calls[0][0].where;
      expect(whereArg.isActive).toBe(true);
    });
  });

  describe('remove', () => {
    it('throws ConflictException instead of deleting a product with order history', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'p1' });
      prisma.orderItem.count.mockResolvedValue(2);
      await expect(service.remove('p1')).rejects.toThrow(ConflictException);
      expect(prisma.product.delete).not.toHaveBeenCalled();
    });

    it('deletes a product with no order history', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 'p1' });
      prisma.orderItem.count.mockResolvedValue(0);
      const result = await service.remove('p1');
      expect(result).toEqual({ success: true });
      expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    });
  });
});
