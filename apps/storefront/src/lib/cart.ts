import { apiFetch } from './api';
import type { CartView } from '@/types/api';

export function getCart() {
  return apiFetch<CartView>('/cart', { auth: true, noStore: true });
}

export function addCartItem(productId: string, quantity: number) {
  return apiFetch<CartView>('/cart/items', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ productId, quantity }),
  });
}

export function updateCartItem(itemId: string, quantity: number) {
  return apiFetch<CartView>(`/cart/items/${itemId}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(itemId: string) {
  return apiFetch<CartView>(`/cart/items/${itemId}`, { method: 'DELETE', auth: true });
}
