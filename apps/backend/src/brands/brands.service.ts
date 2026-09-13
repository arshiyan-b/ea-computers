import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Brand, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { QueryBrandDto } from './dto/query-brand.dto';
import { slugify } from '../common/utils/slugify.util';
import { buildPaginationMeta, PaginatedResult } from '../common/dto/paginated-result.dto';
import { resolveSortField } from '../common/utils/sort.util';

const ALLOWED_SORT_FIELDS = ['name', 'createdAt'] as const;

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBrandDto): Promise<Brand> {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    await this.assertSlugAvailable(slug);
    return this.prisma.brand.create({
      data: { name: dto.name, slug, logo: dto.logo, isActive: dto.isActive ?? true },
    });
  }

  async findAll(query: QueryBrandDto): Promise<PaginatedResult<Brand>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sort = resolveSortField(query.sort, ALLOWED_SORT_FIELDS, 'name');
    const order = query.order ?? 'asc';

    const where: Prisma.BrandWhereInput = query.includeInactive ? {} : { isActive: true };

    const [data, total] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.brand.count({ where }),
    ]);
    return { data, meta: buildPaginationMeta(page, limit, total) };
  }

  /** Looks a brand up by slug (storefront) or id (admin edit/show views). */
  async findBySlug(slugOrId: string, isAdmin = false): Promise<Brand> {
    const brand = await this.prisma.brand.findFirst({ where: { OR: [{ slug: slugOrId }, { id: slugOrId }] } });
    if (!brand || (!brand.isActive && !isAdmin)) throw new NotFoundException(`Brand "${slugOrId}" not found`);
    return brand;
  }

  async findByIdOrThrow(id: string): Promise<Brand> {
    const brand = await this.prisma.brand.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    await this.findByIdOrThrow(id);
    let slug: string | undefined;
    if (dto.slug || dto.name) {
      slug = slugify(dto.slug ?? dto.name!);
      await this.assertSlugAvailable(slug, id);
    }
    return this.prisma.brand.update({
      where: { id },
      data: { name: dto.name, slug, logo: dto.logo, isActive: dto.isActive },
    });
  }

  async remove(id: string): Promise<{ success: true }> {
    await this.findByIdOrThrow(id);
    const productCount = await this.prisma.product.count({ where: { brandId: id } });
    if (productCount > 0) {
      throw new ConflictException(
        'This brand still has products. Deactivate it instead, or reassign those products first.',
      );
    }
    await this.prisma.brand.delete({ where: { id } });
    return { success: true };
  }

  private async assertSlugAvailable(slug: string, excludeId?: string) {
    const existing = await this.prisma.brand.findUnique({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Brand slug "${slug}" is already in use`);
    }
  }
}
