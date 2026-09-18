import type { MetadataRoute } from 'next';
import { listProducts } from '@/lib/products';
import { listCategories } from '@/lib/categories';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    listProducts({ limit: 100 }).catch(() => ({ data: [], meta: null })),
    listCategories({ limit: 50 }).catch(() => ({ data: [], meta: null })),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = ['', '/store', '/cart', '/login', '/register'].map(
    (path) => ({ url: `${SITE_URL}${path}`, changeFrequency: 'daily', priority: path === '' ? 1 : 0.7 }),
  );

  const productRoutes: MetadataRoute.Sitemap = products.data.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.data.map((c) => ({
    url: `${SITE_URL}/categories/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
