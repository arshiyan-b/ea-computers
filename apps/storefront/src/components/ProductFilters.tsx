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

  /** Toggles `slug` in a comma-separated multi-select query param (category/brand). */
  function toggleListParam(key: string, slug: string) {
    const current = (searchParams.get(key) ?? '').split(',').filter(Boolean);
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    updateParam(key, next.length ? next.join(',') : null);
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

  const activeCategories = (searchParams.get('category') ?? '').split(',').filter(Boolean);
  const activeBrands = (searchParams.get('brand') ?? '').split(',').filter(Boolean);
  const inStockOnly = searchParams.get('stock') === 'true';
  const featuredOnly = searchParams.get('featured') === 'true';
  const activeFilterCount =
    activeCategories.length + activeBrands.length + (inStockOnly ? 1 : 0) + (featuredOnly ? 1 : 0);

  return (
    <aside className="w-full shrink-0 space-y-6 lg:w-64">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          Filters
          {activeFilterCount > 0 && (
            <span className="grid h-5 min-w-5 animate-scale-in place-items-center rounded-full bg-brand-700 px-1 text-[11px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </h2>
        <button
          onClick={clearAll}
          className="text-xs font-medium text-brand-700 transition hover:underline"
        >
          Clear all
        </button>
      </div>

      {categories.length > 0 && (
        <FilterGroup title="Category">
          {categories.map((cat) => (
            <FilterCheckbox
              key={cat.id}
              label={cat.name}
              checked={activeCategories.includes(cat.slug)}
              onChange={() => toggleListParam('category', cat.slug)}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Brand">
        {brands.map((brand) => (
          <FilterCheckbox
            key={brand.id}
            label={brand.name}
            checked={activeBrands.includes(brand.slug)}
            onChange={() => toggleListParam('brand', brand.slug)}
          />
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
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm transition focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </form>
        <button
          onClick={applyPriceRange}
          className="mt-2 w-full rounded-md bg-slate-100 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200 active:scale-[0.98]"
        >
          Apply
        </button>
      </FilterGroup>

      <FilterGroup title="Availability">
        <FilterCheckbox
          label="In stock only"
          checked={inStockOnly}
          onChange={(checked) => updateParam('stock', checked ? 'true' : null)}
        />
        <FilterCheckbox
          label="Featured only"
          checked={featuredOnly}
          onChange={(checked) => updateParam('featured', checked ? 'true' : null)}
        />
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="animate-fade-in-up border-b border-slate-200 pb-5">
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

/** A custom-styled, animated checkbox — swaps out the plain native checkbox look. */
function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-0.5 text-sm text-slate-600">
      <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 h-4 w-4 cursor-pointer appearance-none rounded border border-slate-300 transition-colors checked:border-brand-700 checked:bg-brand-700 group-hover:border-brand-400"
        />
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="pointer-events-none absolute h-3 w-3 scale-0 text-white transition-transform duration-150 peer-checked:scale-100"
        >
          <path
            d="M3.5 8.5L6.5 11.5L12.5 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="transition-colors group-hover:text-slate-900">{label}</span>
    </label>
  );
}
