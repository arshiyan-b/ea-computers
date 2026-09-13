import { apiFetch, buildQuery } from './api';
import type { Order, Paginated } from '@/types/api';

export function listMyOrders(params: { page?: number; limit?: number } = {}) {
  return apiFetch<Paginated<Order>>(`/orders${buildQuery(params)}`, { auth: true, noStore: true });
}

export function getMyOrder(id: string) {
  return apiFetch<Order>(`/orders/${id}`, { auth: true, noStore: true });
}
