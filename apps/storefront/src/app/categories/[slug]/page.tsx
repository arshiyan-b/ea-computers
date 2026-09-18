import { listCategories } from '@/lib/categories';
import { CategoryDetailClient } from '@/components/CategoryDetailClient';

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const res = await listCategories({ limit: 500 });
    return res.data.length > 0 ? res.data.map((c) => ({ slug: c.slug })) : [{ slug: '__none__' }];
  } catch {
    return [{ slug: '__none__' }];
  }
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <CategoryDetailClient slug={params.slug} />;
}
