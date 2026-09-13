import { Prisma } from '@prisma/client';
import { QueryProductDto } from './dto/query-product.dto';

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
  options: { isAdmin: boolean; categoryId?: string; brandId?: string },
): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (!options.isAdmin || !query.includeInactive) {
    where.isActive = true;
  }

  if (options.categoryId) where.categoryId = options.categoryId;
  if (options.brandId) where.brandId = options.brandId;

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
