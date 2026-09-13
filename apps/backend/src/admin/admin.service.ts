import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  lowStockProducts: number;
}

const LOW_STOCK_THRESHOLD = 5;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [totalProducts, totalOrders, pendingOrders, totalCustomers, lowStockProducts] =
      await Promise.all([
        this.prisma.product.count({ where: { isActive: true } }),
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: 'PENDING' } }),
        this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
        this.prisma.product.count({
          where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD } },
        }),
      ]);

    return { totalProducts, totalOrders, pendingOrders, totalCustomers, lowStockProducts };
  }
}
