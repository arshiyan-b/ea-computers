import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';

describe('OrdersService', () => {
  let prisma: PrismaMock;
  let service: OrdersService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new OrdersService(prisma as any);
  });

  describe('findOneForUser', () => {
    it('lets a customer view their own order', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', userId: 'user-1' });
      const order = await service.findOneForUser('user-1', 'order-1');
      expect(order.id).toBe('order-1');
    });

    it("rejects a customer viewing another customer's order", async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', userId: 'someone-else' });
      await expect(service.findOneForUser('user-1', 'order-1')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException for a missing order', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(service.findOneForUser('user-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllForUser', () => {
    it('scopes the query to the requesting user only', async () => {
      prisma.order.findMany.mockResolvedValue([]);
      prisma.order.count.mockResolvedValue(0);

      await service.findAllForUser('user-1', {} as any);

      expect(prisma.order.findMany.mock.calls[0][0].where).toMatchObject({ userId: 'user-1' });
    });
  });

  describe('updateStatus', () => {
    it('updates the status of an existing order', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1' });
      prisma.order.update.mockResolvedValue({ id: 'order-1', status: 'SHIPPED' });

      const result = await service.updateStatus('order-1', 'SHIPPED' as any);

      expect(result.status).toBe('SHIPPED');
      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'order-1' }, data: { status: 'SHIPPED' } }),
      );
    });

    it('throws NotFoundException when updating a missing order', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(service.updateStatus('missing', 'SHIPPED' as any)).rejects.toThrow(NotFoundException);
    });
  });
});
