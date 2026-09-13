import { create } from 'zustand';
import type { CartView } from '@/types/api';
import { addCartItem, getCart, removeCartItem, updateCartItem } from '@/lib/cart';
import { ApiError } from '@/lib/api';

interface CartState {
  cart: CartView | null;
  isLoading: boolean;
  error: string | null;
  itemCount: number;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

function countItems(cart: CartView | null): number {
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,
  itemCount: 0,

  refresh: async () => {
    set({ isLoading: true, error: null });
    try {
      const cart = await getCart();
      set({ cart, itemCount: countItems(cart), isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Failed to load cart' });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ error: null });
    try {
      const cart = await addCartItem(productId, quantity);
      set({ cart, itemCount: countItems(cart) });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to add item to cart';
      set({ error: message });
      throw err;
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ error: null });
    try {
      const cart = await updateCartItem(itemId, quantity);
      set({ cart, itemCount: countItems(cart) });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update quantity';
      set({ error: message });
      throw err;
    }
  },

  removeItem: async (itemId) => {
    set({ error: null });
    const previous = get().cart;
    try {
      const cart = await removeCartItem(itemId);
      set({ cart, itemCount: countItems(cart) });
    } catch (err) {
      set({ cart: previous, error: err instanceof Error ? err.message : 'Failed to remove item' });
      throw err;
    }
  },
}));
