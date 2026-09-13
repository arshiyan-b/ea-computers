import { apiFetch, buildQuery } from './api';
import type { Paginated, Product } from '@/types/api';

export interface ProductQuery {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  stock?: boolean;
  featured?: boolean;
  sort?: 'price' | 'name' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  excludeId?: string;
}

export function listProducts(query: ProductQuery = {}): Promise<Paginated<Product>> {
  return apiFetch(`/products${buildQuery(query)}`, { noStore: true });
}

export function getProductBySlug(slug: string): Promise<Product> {
  return apiFetch(`/products/${slug}`, { noStore: true });
}
