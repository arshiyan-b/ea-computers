import { Prisma } from '@prisma/client';
import { QueryProductDto } from './dto/query-product.dto';

/** Splits a "laptops,desktop-pcs" query param into ["laptops", "desktop-pcs"]. */
export function parseSlugList(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Builds the Prisma `where` clause for product search/filtering.
 *
 * Kept as a pure, standalone function (rather than inline in the service) so
 * that swapping Postgres full-text search for something like Meilisearch
 * later only means replacing how `search` is resolved to a set of product
 * ids here — the controller, DTOs and the rest of ProductsService stay
 * untouched.
 */
export function buildProductWhere(
  query: QueryProductDto,
  options: { isAdmin: boolean; categoryIds?: string[]; brandIds?: string[] },
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (!options.isAdmin || !query.includeInactive) {
    where.isActive = true;
  }

  if (options.categoryIds?.length) {
    where.categoryId = options.categoryIds.length === 1 ? options.categoryIds[0] : { in: options.categoryIds };
  }
  if (options.brandIds?.length) {
    where.brandId = options.brandIds.length === 1 ? options.brandIds[0] : { in: options.brandIds };
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {
      ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
      ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
    };
  }

  if (query.stock) {
    where.stock = { gt: 0 };
  }

  if (query.featured !== undefined) {
    where.isFeatured = query.featured;
  }

  if (query.excludeId) {
    where.id = { not: query.excludeId };
  }

  if (query.search?.trim()) {
    const term = query.search.trim();
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { sku: { contains: term, mode: 'insensitive' } },
    ];
  }

  return where;
}
