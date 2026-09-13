import { apiFetch, buildQuery } from './api';
import type { Brand, Paginated } from '@/types/api';

export function listBrands(params: { limit?: number } = {}): Promise<Paginated<Brand>> {
  return apiFetch(`/brands${buildQuery({ limit: 50, ...params })}`, { noStore: true });
}
