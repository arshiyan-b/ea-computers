'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import { CategoryDetailClient } from '@/components/CategoryDetailClient';

export default function NotFound() {
  const [slugMatch, setSlugMatch] = useState<{ kind: 'products' | 'categories'; slug: string } | null | undefined>(
    undefined,
  );

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/(products|categories)\/([^/]+)\/?$/);
    setSlugMatch(match ? { kind: match[1] as 'products' | 'categories', slug: match[2] } : null);
  }, []);

  if (slugMatch === undefined) return null;

  if (slugMatch?.kind === 'products') return <ProductDetailClient slug={slugMatch.slug} />;
  if (slugMatch?.kind === 'categories') return <CategoryDetailClient slug={slugMatch.slug} />;

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-extrabold text-slate-200">404</h1>
      <p className="mt-2 text-lg font-semibold text-slate-800">Page not found</p>
      <p className="mt-1 text-sm text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
      >
        Back to Home
      </Link>
    </div>
  );
}
