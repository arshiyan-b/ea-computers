'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getCategoryBySlug } from '@/lib/categories';
import { listProducts } from '@/lib/products';
import { listBrands } from '@/lib/brands';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';
import { SortSelect } from '@/components/SortSelect';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ApiError } from '@/lib/api';
import type { Brand, Category, Paginated, Product } from '@/types/api';

export function CategoryDetailClient({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<div className="container-page py-8" />}>
      <CategoryDetailContent slug={slug} />
    </Suspense>
  );
}

function CategoryDetailContent({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const searchParamsObj = Object.fromEntries(searchParams.entries());

  const [category, setCategory] = useState<Category | null | undefined>(undefined);
  const [productsRes, setProductsRes] = useState<Paginated<Product> | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);

  const page = Number(searchParams.get('page') ?? '1') || 1;
  const sort = (searchParams.get('sort') as 'price' | 'name' | 'createdAt') ?? 'createdAt';
  const order = (searchParams.get('order') as 'asc' | 'desc') ?? 'desc';
  const search = searchParams.get('search') ?? undefined;
  const brand = searchParams.get('brand') ?? undefined;
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const stock = searchParams.get('stock') === 'true';
  const featured = searchParams.get('featured') === 'true';

  useEffect(() => {
    setCategory(undefined);
    getCategoryBySlug(slug)
      .then((c) => setCategory(c))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setCategory(null);
          return;
        }
        throw err;
      });
  }, [slug]);

  useEffect(() => {
    if (category) document.title = category.name;
  }, [category]);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    listProducts({
      category: category.slug,
      search,
      brand,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      stock: stock ? true : undefined,
      featured: featured ? true : undefined,
      sort,
      order,
      page,
      limit: 20,
    })
      .then((res) => {
        if (!cancelled) setProductsRes(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [category, search, brand, minPrice, maxPrice, stock, featured, sort, order, page]);

  useEffect(() => {
    listBrands({ limit: 50 })
      .then((res) => setBrands(res.data))
      .catch(() => {});
  }, []);

  if (category === undefined) {
    return (
      <div className="container-page py-8">
        <div className="h-96 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (category === null) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-xl font-bold text-slate-900">Category not found</h1>
        <Link href="/store" className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline">
          Browse all products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{category.name}</h1>
        {category.description && <p className="mt-1 text-sm text-slate-500">{category.description}</p>}
        {category.children && category.children.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {category.children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-brand-600 hover:text-brand-700"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <ProductFilters categories={[]} brands={brands} />

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">{productsRes?.meta.total ?? 0} products</p>
            <SortSelect />
          </div>

          {productsRes && productsRes.data.length === 0 ? (
            <EmptyState
              title="No products in this category yet"
              description="Check back soon, or browse our full catalog."
              actionHref="/store"
              actionLabel="Browse all products"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {(productsRes?.data ?? []).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          {productsRes && (
            <Pagination
              meta={productsRes.meta}
              basePath={`/categories/${category.slug}`}
              searchParams={searchParamsObj}
            />
          )}
        </div>
      </div>
    </div>
  );
}
