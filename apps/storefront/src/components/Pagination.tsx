import Link from 'next/link';
import type { PaginationMeta } from '@/types/api';

export function Pagination({
  meta,
  basePath,
  searchParams,
}: {
  meta: PaginationMeta;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (meta.totalPages <= 1) return null;

  function hrefFor(page: number) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v !== undefined) as [string, string][],
    );
    params.set('page', String(page));
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === meta.totalPages || Math.abs(p - meta.page) <= 1,
  );

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <PageLink page={meta.page - 1} disabled={meta.page <= 1} href={hrefFor(meta.page - 1)}>
        Prev
      </PageLink>
      {pages.map((page, i) => (
        <span key={page} className="flex items-center gap-1">
          {i > 0 && pages[i - 1] !== page - 1 && <span className="px-1 text-slate-400">…</span>}
          <Link
            href={hrefFor(page)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              page === meta.page ? 'bg-brand-700 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {page}
          </Link>
        </span>
      ))}
      <PageLink page={meta.page + 1} disabled={meta.page >= meta.totalPages} href={hrefFor(meta.page + 1)}>
        Next
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="rounded-md px-3 py-1.5 text-sm text-slate-300">{children}</span>;
  }
  return (
    <Link href={href} className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
      {children}
    </Link>
  );
}
