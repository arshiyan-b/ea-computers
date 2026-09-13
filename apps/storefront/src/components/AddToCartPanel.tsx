'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';

export function AddToCartPanel({
  productId,
  productName,
  stock,
}: {
  productId: string;
  productName: string;
  stock: number;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const push = useToastStore((s) => s.push);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    setAdding(true);
    try {
      await addItem(productId, quantity);
      push(`Added ${quantity} × "${productName}" to your cart`, 'success');
    } catch (err) {
      push(err instanceof Error ? err.message : 'Could not add to cart', 'error');
    } finally {
      setAdding(false);
    }
  }

  if (stock <= 0) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-md bg-slate-200 py-3 text-sm font-semibold text-slate-400"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-md border border-slate-300">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-2 text-slate-600 hover:bg-slate-50"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="w-10 text-center text-sm font-medium">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
          className="px-3 py-2 text-slate-600 hover:bg-slate-50"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        onClick={handleAdd}
        disabled={adding}
        className="flex-1 rounded-md bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {adding ? 'Adding…' : 'Add to Cart'}
      </button>
    </div>
  );
}
