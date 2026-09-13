import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueryOrderDto } from './dto/query-order.dto';
import { buildPaginationMeta, PaginatedResult } from '../common/dto/paginated-result.dto';
import { resolveSortField } from '../common/utils/sort.util';

const ALLOWED_SORT_FIELDS = ['createdAt', 'total', 'status'] as const;
const ORDER_INCLUDE = { items: true };

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /** A customer's own order history — never another user's orders. */
  async findAllForUser(userId: string, query: QueryOrderDto): Promise<PaginatedResult<Order>> {
    return this.findAll({ ...query }, { userId });
  }

  async findOneForUser(userId: string, orderId: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }
    return order;
  }

  /** [Admin] All orders, optionally filtered by status. */
  async findAllForAdmin(query: QueryOrderDto): Promise<PaginatedResult<Order>> {
    return this.findAll(query, {});
  }

  async findOneForAdmin(orderId: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(orderId: string, status: Order['status']): Promise<Order> {
    await this.findOneForAdmin(orderId);
    return this.prisma.order.update({ where: { id: orderId }, data: { status }, include: ORDER_INCLUDE });
  }

  private async findAll(
    query: QueryOrderDto,
    extraWhere: Prisma.OrderWhereInput,
  ): Promise<PaginatedResult<Order>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sort = resolveSortField(query.sort, ALLOWED_SORT_FIELDS, 'createdAt');
    const order = query.order ?? 'desc';

    const where: Prisma.OrderWhereInput = { ...extraWhere };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: ORDER_INCLUDE,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, meta: buildPaginationMeta(page, limit, total) };
  }
}
