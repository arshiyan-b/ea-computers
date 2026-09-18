import { listProducts } from '@/lib/products';
import { ProductDetailClient } from '@/components/ProductDetailClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const slugs: string[] = [];
    let page = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await listProducts({ page, limit: 100 });
      slugs.push(...res.data.map((p) => p.slug));
      if (page >= res.meta.totalPages) break;
      page += 1;
    }
    // `output: 'export'` requires at least one route; fall back to a placeholder
    // slug (harmless — it 404s client-side) so builds never break on an empty catalog.
    return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: '__none__' }];
  } catch {
    // Backend unreachable at build time — export with a placeholder route;
    // every real request falls back to the not-found shell, which client-fetches by slug.
    return [{ slug: '__none__' }];
  }
}

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return <ProductDetailClient slug={params.slug} />;
}
