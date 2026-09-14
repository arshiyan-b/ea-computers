import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategoryBySlug } from '@/lib/categories';
import { listProducts } from '@/lib/products';
import { listBrands } from '@/lib/brands';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';
import { SortSelect } from '@/components/SortSelect';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';
import { ApiError } from '@/lib/api';

interface Props {
  params: { slug: string };
  searchParams: Record<string, string | undefined>;
}

async function safeGetCategory(slug: string) {
  try {
    return await getCategoryBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await safeGetCategory(params.slug);
  if (!category) return { title: 'Category not found' };
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} at EA Computers.`,
    alternates: { canonical: `/categories/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await safeGetCategory(params.slug);
  if (!category) notFound();

  const page = Number(searchParams.page ?? '1') || 1;
  const sort = (searchParams.sort as 'price' | 'name' | 'createdAt') ?? 'createdAt';
  const order = (searchParams.order as 'asc' | 'desc') ?? 'desc';

  const [productsRes, brandsRes] = await Promise.all([
    listProducts({
      category: category.slug,
      search: searchParams.search,
      brand: searchParams.brand,
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      stock: searchParams.stock === 'true' ? true : undefined,
      featured: searchParams.featured === 'true' ? true : undefined,
      sort,
      order,
      page,
      limit: 20,
    }),
    listBrands({ limit: 50 }),
  ]);

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
        <ProductFilters categories={[]} brands={brandsRes.data} />

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">{productsRes.meta.total} products</p>
            <SortSelect />
          </div>

          {productsRes.data.length === 0 ? (
            <EmptyState
              title="No products in this category yet"
              description="Check back soon, or browse our full catalog."
              actionHref="/products"
              actionLabel="Browse all products"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {productsRes.data.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          <Pagination
            meta={productsRes.meta}
            basePath={`/categories/${category.slug}`}
            searchParams={searchParams}
          />
        </div>
      </div>
    </div>
  );
}
