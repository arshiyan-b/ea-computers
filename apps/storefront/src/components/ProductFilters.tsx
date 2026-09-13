'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import type { Brand, Category } from '@/types/api';

export function ProductFilters({
  categories,
  brands,
}: {
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '');

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page'); // reset pagination whenever filters change
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyPriceRange(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    router.push(pathname);
    setMinPrice('');
    setMaxPrice('');
  }

  const activeCategory = searchParams.get('category') ?? '';
  const activeBrand = searchParams.get('brand') ?? '';
  const inStockOnly = searchParams.get('stock') === 'true';
  const featuredOnly = searchParams.get('featured') === 'true';

  return (
    <aside className="w-full shrink-0 space-y-6 lg:w-64">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
        <button onClick={clearAll} className="text-xs font-medium text-brand-700 hover:underline">
          Clear all
        </button>
      </div>

      {categories.length > 0 && (
        <FilterGroup title="Category">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="radio"
              name="category"
              checked={activeCategory === ''}
              onChange={() => updateParam('category', null)}
            />
            All Categories
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="radio"
                name="category"
                checked={activeCategory === cat.slug}
                onChange={() => updateParam('category', cat.slug)}
              />
              {cat.name}
            </label>
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Brand">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="radio"
            name="brand"
            checked={activeBrand === ''}
            onChange={() => updateParam('brand', null)}
          />
          All Brands
        </label>
        {brands.map((brand) => (
          <label key={brand.id} className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="radio"
              name="brand"
              checked={activeBrand === brand.slug}
              onChange={() => updateParam('brand', brand.slug)}
            />
            {brand.name}
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Price Range (PKR)">
        <form onSubmit={applyPriceRange} className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          />
        </form>
        <button
          onClick={applyPriceRange}
          className="mt-2 w-full rounded-md bg-slate-100 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
        >
          Apply
        </button>
      </FilterGroup>

      <FilterGroup title="Availability">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateParam('stock', e.target.checked ? 'true' : null)}
          />
          In stock only
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => updateParam('featured', e.target.checked ? 'true' : null)}
          />
          Featured only
        </label>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-200 pb-5">
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}
