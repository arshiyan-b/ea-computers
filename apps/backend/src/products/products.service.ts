import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { slugify } from '../common/utils/slugify.util';
import { buildPaginationMeta, PaginatedResult } from '../common/dto/paginated-result.dto';
import { resolveSortField } from '../common/utils/sort.util';
import { buildProductWhere } from './products-query.builder';

const ALLOWED_SORT_FIELDS = ['price', 'name', 'createdAt'] as const;

const PRODUCT_INCLUDE = {
  images: { orderBy: { sortOrder: 'asc' as const } },
  specifications: { orderBy: { sortOrder: 'asc' as const } },
  category: true,
  brand: true,
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    await this.assertSlugAvailable(slug);
    await this.assertSkuAvailable(dto.sku);
    await this.assertCategoryExists(dto.categoryId);
    if (dto.brandId) await this.assertBrandExists(dto.brandId);

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        stock: dto.stock,
        sku: dto.sku,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        isActive: dto.isActive ?? true,
        isFeatured: dto.isFeatured ?? false,
        images: dto.images?.length
          ? { create: dto.images.map((img, i) => ({ ...img, sortOrder: img.sortOrder ?? i })) }
          : undefined,
        specifications: dto.specifications?.length
          ? { create: dto.specifications.map((spec, i) => ({ ...spec, sortOrder: spec.sortOrder ?? i })) }
          : undefined,
      },
      include: PRODUCT_INCLUDE,
    });
  }

  async findAll(query: QueryProductDto, isAdmin: boolean): Promise<PaginatedResult<Product>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sort = resolveSortField(query.sort, ALLOWED_SORT_FIELDS, 'createdAt');
    const order = query.order ?? 'desc';

    const [category, brand] = await Promise.all([
      query.category ? this.prisma.category.findUnique({ where: { slug: query.category } }) : null,
      query.brand ? this.prisma.brand.findUnique({ where: { slug: query.brand } }) : null,
    ]);
    // An unknown category/brand slug should yield an empty result set, not every product.
    if (query.category && !category) {
      return { data: [], meta: buildPaginationMeta(page, limit, 0) };
    }
    if (query.brand && !brand) {
      return { data: [], meta: buildPaginationMeta(page, limit, 0) };
    }

    const where = buildProductWhere(query, {
      isAdmin,
      categoryId: category?.id,
      brandId: brand?.id,
    });

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, meta: buildPaginationMeta(page, limit, total) };
  }

  /**
   * Looks a product up by slug (storefront) or id (admin dashboard edit/show
   * views) — both hit the same `GET /products/:slug` route.
   */
  async findBySlug(slugOrId: string, isAdmin = false): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
      include: PRODUCT_INCLUDE,
    });
    if (!product || (!product.isActive && !isAdmin)) {
      throw new NotFoundException(`Product "${slugOrId}" not found`);
    }
    return product;
  }

  async findByIdOrThrow(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.findByIdOrThrow(id);

    let slug: string | undefined;
    if (dto.slug || dto.name) {
      slug = slugify(dto.slug ?? dto.name!);
      await this.assertSlugAvailable(slug, id);
    }
    if (dto.sku) await this.assertSkuAvailable(dto.sku, id);
    if (dto.categoryId) await this.assertCategoryExists(dto.categoryId);
    if (dto.brandId) await this.assertBrandExists(dto.brandId);

    return this.prisma.$transaction(async (tx) => {
      if (dto.images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (dto.images.length) {
          await tx.productImage.createMany({
            data: dto.images.map((img, i) => ({ ...img, productId: id, sortOrder: img.sortOrder ?? i })),
          });
        }
      }
      if (dto.specifications) {
        await tx.productSpecification.deleteMany({ where: { productId: id } });
        if (dto.specifications.length) {
          await tx.productSpecification.createMany({
            data: dto.specifications.map((spec, i) => ({
              ...spec,
              productId: id,
              sortOrder: spec.sortOrder ?? i,
            })),
          });
        }
      }
      return tx.product.update({
        where: { id },
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          price: dto.price,
          compareAtPrice: dto.compareAtPrice,
          stock: dto.stock,
          sku: dto.sku,
          categoryId: dto.categoryId,
          brandId: dto.brandId,
          isActive: dto.isActive,
          isFeatured: dto.isFeatured,
        },
        include: PRODUCT_INCLUDE,
      });
    });
  }

  /** Hard-deletes a product, or throws if it has order history — deactivate instead. */
  async remove(id: string): Promise<{ success: true }> {
    await this.findByIdOrThrow(id);
    const orderItemCount = await this.prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      throw new ConflictException(
        'This product appears in past orders and cannot be deleted. Deactivate it instead.',
      );
    }
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  async setActive(id: string, isActive: boolean): Promise<Product> {
    await this.findByIdOrThrow(id);
    return this.prisma.product.update({ where: { id }, data: { isActive }, include: PRODUCT_INCLUDE });
  }

  private async assertSlugAvailable(slug: string, excludeId?: string) {
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`Product slug "${slug}" is already in use`);
    }
  }

  private async assertSkuAvailable(sku: string, excludeId?: string) {
    const existing = await this.prisma.product.findUnique({ where: { sku } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(`SKU "${sku}" is already in use`);
    }
  }

  private async assertCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Category not found');
  }

  private async assertBrandExists(brandId: string) {
    const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
    if (!brand) throw new NotFoundException('Brand not found');
  }
}
