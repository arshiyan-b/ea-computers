'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProductBySlug, listProducts } from '@/lib/products';
import { ProductGallery } from '@/components/ProductGallery';
import { AddToCartPanel } from '@/components/AddToCartPanel';
import { StockBadge } from '@/components/StockBadge';
import { PriceTag } from '@/components/PriceTag';
import { ProductCard } from '@/components/ProductCard';
import { ApiError } from '@/lib/api';
import type { Product } from '@/types/api';

export function ProductDetailClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    setProduct(undefined);
    getProductBySlug(slug)
      .then((p) => setProduct(p))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setProduct(null);
          return;
        }
        throw err;
      });
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    listProducts({ category: product.category.slug, excludeId: product.id, limit: 4 }).then((res) =>
      setRelated(res.data),
    );
  }, [product]);

  useEffect(() => {
    if (product) document.title = product.name;
  }, [product]);

  if (product === undefined) {
    return (
      <div className="container-page py-8">
        <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Product not found</h1>
        <Link href="/store" className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const groupedSpecs = product.specifications.reduce<Record<string, typeof product.specifications>>(
    (acc, spec) => {
      const key = spec.group ?? 'Specifications';
      acc[key] = acc[key] ? [...acc[key], spec] : [spec];
      return acc;
    },
    {},
  );

  return (
    <div className="container-page py-8">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/store" className="hover:text-brand-700">
          Products
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/categories/${product.category.slug}`} className="hover:text-brand-700">
          {product.category.name}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} productName={product.name} />

        <div>
          {product.brand && (
            <Link
              href={`/store?brand=${product.brand.slug}`}
              className="text-sm font-semibold uppercase tracking-wide text-brand-700"
            >
              {product.brand.name}
            </Link>
          )}
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-400">SKU: {product.sku}</p>

          <div className="mt-4">
            <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
          </div>
          <div className="mt-2">
            <StockBadge stock={product.stock} />
          </div>

          <div className="mt-6">
            <AddToCartPanel productId={product.id} productName={product.name} stock={product.stock} />
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">Description</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {product.description}
            </p>
          </div>

          {Object.keys(groupedSpecs).length > 0 && (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Specifications</h2>
              <div className="space-y-5">
                {Object.entries(groupedSpecs).map(([group, specs]) => (
                  <div key={group}>
                    {group !== 'Specifications' && (
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {group}
                      </h3>
                    )}
                    <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                      {specs.map((spec) => (
                        <div key={spec.id} className="flex justify-between px-3 py-2 text-sm">
                          <dt className="text-slate-500">{spec.name}</dt>
                          <dd className="font-medium text-slate-800">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-slate-900">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
