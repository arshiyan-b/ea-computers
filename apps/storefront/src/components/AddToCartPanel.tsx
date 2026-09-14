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
  const [justAdded, setJustAdded] = useState(false);

  async function handleAdd() {
    setAdding(true);
    try {
      await addItem(productId, quantity);
      push(`Added ${quantity} × "${productName}" to your cart`, 'success');
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
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
          className="px-3 py-2 text-slate-600 transition-colors hover:bg-slate-50 active:scale-90"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span key={quantity} className="w-10 animate-scale-in text-center text-sm font-medium">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
          className="px-3 py-2 text-slate-600 transition-colors hover:bg-slate-50 active:scale-90"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        onClick={handleAdd}
        disabled={adding}
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-3 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 ${
          justAdded ? 'bg-green-600' : 'bg-slate-900 hover:bg-brand-700'
        }`}
      >
        {justAdded ? 'Added to Cart ✓' : adding ? 'Adding…' : 'Add to Cart'}
      </button>
    </div>
  );
}
