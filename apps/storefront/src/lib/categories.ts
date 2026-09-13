import { apiFetch, buildQuery } from './api';
import type { Category, Paginated } from '@/types/api';

export function listCategories(
  params: { topLevelOnly?: boolean; limit?: number } = {},
): Promise<Paginated<Category>> {
  return apiFetch(`/categories${buildQuery({ limit: 50, ...params })}`, { noStore: true });
}

export function getCategoryBySlug(slug: string): Promise<Category> {
  return apiFetch(`/categories/${slug}`, { noStore: true });
}
