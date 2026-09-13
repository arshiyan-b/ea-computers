import Link from 'next/link';

const FOOTER_LINKS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Shop',
    links: [
      { href: '/products', label: 'All Products' },
      { href: '/categories/laptops', label: 'Laptops' },
      { href: '/categories/desktop-pcs', label: 'Desktop PCs' },
      { href: '/categories/graphics-cards', label: 'Graphics Cards' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/account', label: 'My Account' },
      { href: '/account/orders', label: 'Order History' },
      { href: '/login', label: 'Sign In' },
      { href: '/register', label: 'Create Account' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/', label: 'About EA Computers' },
      { href: '/checkout', label: 'Shipping & Payment' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="container-page grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              EA
            </span>
            <span className="text-base font-bold text-white">EA Computers</span>
          </div>
          <p className="text-sm text-slate-400">
            Pakistan&apos;s trusted destination for laptops, desktops, components and gaming gear —
            genuine products, competitive prices, and dependable after-sales support.
          </p>
        </div>
        {FOOTER_LINKS.map((group) => (
          <div key={group.title}>
            <h3 className="mb-3 text-sm font-semibold text-white">{group.title}</h3>
            <ul className="space-y-2 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-800 py-4">
        <p className="container-page text-xs text-slate-500">
          © {new Date().getFullYear()} EA Computers. All rights reserved. Prices in PKR, inclusive
          of applicable taxes. Currently supporting Cash on Delivery only.
        </p>
      </div>
    </footer>
  );
}
