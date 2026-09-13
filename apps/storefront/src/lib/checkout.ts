import { apiFetch } from './api';
import type { Order } from '@/types/api';

export interface CheckoutInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes?: string;
}

export function checkout(input: CheckoutInput) {
  return apiFetch<Order>('/checkout', { method: 'POST', auth: true, body: JSON.stringify(input) });
}
