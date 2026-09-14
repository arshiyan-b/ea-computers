'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/types/api';
import { PriceTag } from './PriceTag';
import { StockBadge } from './StockBadge';
import { useCartStore } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const push = useToastStore((s) => s.push);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const image = product.images[0]?.url;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addItem(product.id, 1);
      push(`Added "${product.name}" to your cart`, 'success');
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
    } catch (err) {
      push(err instanceof Error ? err.message : 'Could not add to cart', 'error');
    } finally {
      setAdding(false);
    }
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      style={{ animationDelay: `${Math.min(index, 10) * 60}ms` }}
      className="group flex animate-fade-in-up flex-col overflow-hidden rounded-xl border border-slate-200 bg-white opacity-0 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        {image ? (
          <Image
            src={image}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-300">No image</div>
        )}
        {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
          <span className="absolute left-2 top-2 animate-scale-in rounded-full bg-brand-700 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
            Sale
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.brand && <span className="text-xs font-medium text-slate-400">{product.brand.name}</span>}
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 transition-colors group-hover:text-brand-700">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
        </div>
        <StockBadge stock={product.stock} />
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || adding}
          className={`mt-2 flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium text-white transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 ${
            justAdded ? 'bg-green-600' : 'bg-slate-900 hover:bg-brand-700'
          }`}
        >
          {justAdded ? (
            <>
              <CheckIcon className="animate-scale-in" />
              Added
            </>
          ) : product.stock <= 0 ? (
            'Out of Stock'
          ) : adding ? (
            'Adding…'
          ) : (
            'Add to Cart'
          )}
        </button>
      </div>
    </Link>
  );
}

function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={`h-3.5 w-3.5 ${className}`}>
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
