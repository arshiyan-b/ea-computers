'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/types/api';
import { PriceTag } from './PriceTag';
import { StockBadge } from './StockBadge';
import { useCartStore } from '@/store/cart-store';
import { useToastStore } from '@/store/toast-store';

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const push = useToastStore((s) => s.push);
  const [adding, setAdding] = useState(false);
  const image = product.images[0]?.url;

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    try {
      await addItem(product.id, 1);
      push(`Added "${product.name}" to your cart`, 'success');
    } catch (err) {
      push(err instanceof Error ? err.message : 'Could not add to cart', 'error');
    } finally {
      setAdding(false);
    }
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        {image ? (
          <Image
            src={image}
            alt={product.images[0]?.alt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-300">No image</div>
        )}
        {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-700 px-2 py-0.5 text-xs font-semibold text-white">
            Sale
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.brand && <span className="text-xs font-medium text-slate-400">{product.brand.name}</span>}
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="sm" />
        </div>
        <StockBadge stock={product.stock} />
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || adding}
          className="mt-2 w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {product.stock <= 0 ? 'Out of Stock' : adding ? 'Adding…' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}
