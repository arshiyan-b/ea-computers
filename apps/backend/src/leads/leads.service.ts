import { Injectable } from '@nestjs/common';
import { Lead } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import { buildPaginationMeta, PaginatedResult } from '../common/dto/paginated-result.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLeadDto): Promise<Lead> {
    return this.prisma.lead.create({ data: dto });
  }

  /** [Admin] All "Get in Touch" submissions, newest first. */
  async findAllForAdmin(query: QueryLeadDto): Promise<PaginatedResult<Lead>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.lead.count(),
    ]);
    return { data, meta: buildPaginationMeta(page, limit, total) };
  }
}
