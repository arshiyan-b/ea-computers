'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';

const NAV_LINKS = [
  { href: '/products', label: 'All Products' },
  { href: '/categories/graphics-cards', label: 'Graphics Cards' },
  { href: '/categories/laptops', label: 'Laptops' },
  { href: '/categories/desktop-pcs', label: 'Desktop PCs' },
  { href: '/categories/monitors', label: 'Monitors' },
];

export function Header() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const itemCount = useCartStore((s) => s.itemCount);
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    useAuthStore.getState().init();
    useCartStore.getState().refresh();
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-700 font-bold text-white">
            EA
          </span>
          <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:block">
            EA Computers
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-700">
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="ml-auto hidden flex-1 max-w-md md:flex">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for GPUs, laptops, SSDs..."
            className="w-full rounded-l-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="rounded-r-md bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
          >
            Search
          </button>
        </form>

        <div className="ml-auto flex items-center gap-4 md:ml-0">
          <Link href="/cart" className="relative flex items-center gap-1 text-slate-700 hover:text-brand-700">
            <CartIcon />
            <span className="hidden text-sm font-medium sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-brand-700 text-[11px] font-semibold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <Link href="/account" className="text-sm font-medium text-slate-700 hover:text-brand-700">
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-slate-500 hover:text-red-600"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-700 hover:text-brand-700 sm:block"
            >
              Sign in
            </Link>
          )}

          <button
            className="text-slate-700 lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 lg:hidden">
          <form onSubmit={handleSearch} className="mb-3 flex">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-l-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button className="rounded-r-md bg-brand-700 px-3 text-sm text-white">Go</button>
          </form>
          <nav className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <hr className="my-1 border-slate-200" />
            {user ? (
              <>
                <Link href="/account" onClick={() => setMobileOpen(false)}>
                  My Account
                </Link>
                <button className="text-left text-red-600" onClick={logout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  Sign in
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  Create account
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}
