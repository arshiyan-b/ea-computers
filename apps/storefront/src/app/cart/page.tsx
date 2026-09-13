'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';
import { formatPKR } from '@/lib/format';
import { EmptyState } from '@/components/EmptyState';

export default function CartPage() {
  const { cart, isLoading, refresh, updateItem, removeItem } = useCartStore();
  const push = useToastStore((s) => s.push);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleQuantityChange(itemId: string, quantity: number) {
    try {
      await updateItem(itemId, quantity);
    } catch (err) {
      push(err instanceof Error ? err.message : 'Could not update quantity', 'error');
    }
  }

  async function handleRemove(itemId: string, name: string) {
    try {
      await removeItem(itemId);
      push(`Removed "${name}" from your cart`, 'info');
    } catch (err) {
      push(err instanceof Error ? err.message : 'Could not remove item', 'error');
    }
  }

  if (isLoading && !cart) {
    return (
      <div className="container-page py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-page py-12">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Your Cart</h1>
        <EmptyState
          title="Your cart is empty"
          description="Browse our catalog and add something to your cart."
          actionHref="/products"
          actionLabel="Start Shopping"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <Link href={`/products/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : null}
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/products/${item.slug}`} className="text-sm font-semibold text-slate-800 hover:text-brand-700">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => handleRemove(item.id, item.name)}
                    className="text-xs font-medium text-slate-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-sm text-slate-500">{formatPKR(item.price)} each</p>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-slate-300">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatPKR(item.subtotal)}</span>
                </div>
                {item.quantity >= item.stock && (
                  <p className="mt-1 text-xs text-amber-600">Max available stock reached</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatPKR(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatPKR(cart.total)}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block w-full rounded-md bg-brand-700 py-3 text-center text-sm font-semibold text-white hover:bg-brand-800"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
