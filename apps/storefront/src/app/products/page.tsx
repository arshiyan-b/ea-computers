import type { Metadata } from 'next';
import { listProducts } from '@/lib/products';
import { listCategories } from '@/lib/categories';
import { listBrands } from '@/lib/brands';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters } from '@/components/ProductFilters';
import { SortSelect } from '@/components/SortSelect';
import { Pagination } from '@/components/Pagination';
import { EmptyState } from '@/components/EmptyState';

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse laptops, desktop PCs, graphics cards, processors and more at EA Computers.',
};

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const page = Number(searchParams.page ?? '1') || 1;
  const sort = (searchParams.sort as 'price' | 'name' | 'createdAt') ?? 'createdAt';
  const order = (searchParams.order as 'asc' | 'desc') ?? 'desc';

  const [productsRes, categoriesRes, brandsRes] = await Promise.all([
    listProducts({
      search: searchParams.search,
      category: searchParams.category,
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
    listCategories({ limit: 50 }),
    listBrands({ limit: 50 }),
  ]);

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {searchParams.search ? `Search results for "${searchParams.search}"` : 'All Products'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{productsRes.meta.total} products found</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <ProductFilters categories={categoriesRes.data} brands={brandsRes.data} />

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-end">
            <SortSelect />
          </div>

          {productsRes.data.length === 0 ? (
            <EmptyState
              title="No products match your filters"
              description="Try widening your price range or clearing some filters."
              actionHref="/products"
              actionLabel="Clear filters"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {productsRes.data.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          <Pagination meta={productsRes.meta} basePath="/products" searchParams={searchParams} />
        </div>
      </div>
    </div>
  );
}
