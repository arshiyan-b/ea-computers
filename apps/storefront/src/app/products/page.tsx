'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductsRedirectPage() {
  return (
    <Suspense fallback={null}>
      <ProductsRedirect />
    </Suspense>
  );
}

function ProductsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    router.replace(qs ? `/store?${qs}` : '/store');
  }, [router, searchParams]);

  return null;
}
