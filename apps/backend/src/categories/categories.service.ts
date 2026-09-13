import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { slugify } from '../common/utils/slugify.util';
import { buildPaginationMeta, PaginatedResult } from '../common/dto/paginated-result.dto';
import { resolveSortField } from '../common/utils/sort.util';
import { Category, Prisma } from '@prisma/client';

const ALLOWED_SORT_FIELDS = ['name', 'createdAt'] as const;

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    await this.assertSlugAvailable(slug);
    if (dto.parentId) {
      await this.findByIdOrThrow(dto.parentId);
    }
    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        image: dto.image,
        parentId: dto.parentId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(query: QueryCategoryDto): Promise<PaginatedResult<Category & { children?: Category[] }>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sort = resolveSortField(query.sort, ALLOWED_SORT_FIELDS, 'name');
    const order = query.order ?? 'asc';

    const where: Prisma.CategoryWhereInput = {};
    if (!query.includeInactive) where.isActive = true;
    if (query.topLevelOnly) where.parentId = null;
    if (query.parentId) where.parentId = query.parentId;

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        include: { children: true },
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(page, limit, total) };
  }

  /** Looks a category up by slug (storefront) or id (admin edit/show views). */
  async findBySlug(slugOrId: string, isAdmin = false): Promise<Category & { children: Category[] }> {
    const category = await this.prisma.category.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
      include: { children: { where: isAdmin ? {} : { isActive: true } } },
    });
    if (!category || (!category.isActive && !isAdmin)) {
      throw new NotFoundException(`Category "${slugOrId}" not found`);
    }
    return category;
  }

  async findByIdOrThrow(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    await this.findByIdOrThrow(id);

    if (dto.parentId === id) {
      throw new BadRequestException('A category cannot be its own parent');
    }
    if (dto.parentId) {
      await this.findByIdOrThrow(dto.parentId);
    }

    let slug: string | undefined;
    if (dto.slug || dto.name) {
      slug = slugify(dto.slug ?? dto.name!);
      await this.assertSlugAvailable(slug, id);
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        image: dto.image,
        parentId: dto.parentId,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string): Promise<{ success: true }> {
    await this.findByIdOrThrow(id);
    const [productCount, childCount] = await Promise.all([
      this.prisma.product.count({ where: { categoryId: id } }),
      this.prisma.category.count({ where: { parentId: id } }),
    ]);
    if (productCount > 0 || childCount > 0) {
      throw new ConflictException(
        'This category still has products or sub-categories. Deactivate it instead, or move/remove them first.',
      );
    }
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  private async assertSlugAvailable(slug: string, excludeId?: string) {
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Category slug "${slug}" is already in use`);
    }
  }
}
