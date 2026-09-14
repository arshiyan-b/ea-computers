import Link from 'next/link';
import { listProducts } from '@/lib/products';
import { listCategories } from '@/lib/categories';
import { listBrands } from '@/lib/brands';
import { ProductCard } from '@/components/ProductCard';
import { HeroSlider } from '@/components/HeroSlider';

export const revalidate = 60;

export default async function HomePage() {
  const [featured, bestSellers, deals, categories, brands] = await Promise.all([
    listProducts({ featured: true, limit: 8 }),
    listProducts({ stock: true, sort: 'price', order: 'desc', limit: 4 }),
    listProducts({ sort: 'createdAt', order: 'desc', limit: 100 }).then((res) => ({
      ...res,
      data: res.data.filter((p) => p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price)).slice(0, 4),
    })),
    listCategories({ topLevelOnly: false, limit: 12 }),
    listBrands({ limit: 12 }),
  ]);

  return (
    <div>
      <HeroSlider />

      <section className="container-page py-12">
        <SectionHeader title="Shop by Category" subtitle="Find exactly what your build needs" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.data.slice(0, 12).map((category, i) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              style={{ animationDelay: `${i * 40}ms` }}
              className="group flex animate-fade-in-up flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center opacity-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-lg font-bold text-brand-700 transition-transform duration-200 group-hover:scale-110">
                {category.name.charAt(0)}
              </span>
              <span className="text-xs font-medium text-slate-700 group-hover:text-brand-700">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {featured.data.length > 0 && (
        <section className="container-page py-12">
          <SectionHeader
            title="Featured Products"
            subtitle="Hand-picked hardware, ready to ship"
            href="/products?featured=true"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.data.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      )}

      {bestSellers.data.length > 0 && (
        <section className="bg-white py-12">
          <div className="container-page">
            <SectionHeader title="Best Sellers" subtitle="Our customers' favorite high-performance gear" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {bestSellers.data.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {deals.data.length > 0 && (
        <section className="container-page py-12">
          <SectionHeader title="Deals" subtitle="Limited-time price drops" href="/products" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {deals.data.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-slate-200 bg-white py-10">
        <div className="container-page">
          <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-slate-400">
            Trusted Brands We Carry
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {brands.data.map((brand, i) => (
              <span
                key={brand.id}
                style={{ animationDelay: `${i * 30}ms` }}
                className="animate-fade-in text-lg font-bold text-slate-400 opacity-0 transition-all duration-200 hover:scale-110 hover:text-slate-700"
              >
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <WhyChooseUs />
    </div>
  );
}

function SectionHeader({ title, subtitle, href }: { title: string; subtitle: string; href?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {href && (
        <Link href={href} className="hidden text-sm font-medium text-brand-700 hover:underline sm:block">
          View all →
        </Link>
      )}
    </div>
  );
}

const REASONS = [
  {
    title: 'Genuine Products',
    description: 'Every item is sourced from authorized distributors, with full manufacturer warranty.',
  },
  {
    title: 'Competitive Pricing',
    description: 'We keep margins tight so you get flagship hardware without flagship markups.',
  },
  {
    title: 'Cash on Delivery',
    description: 'Pay when your order arrives — no online payment required (for now).',
  },
  {
    title: 'Expert Support',
    description: "Our team knows hardware — get real advice on what fits your build and budget.",
  },
];

function WhyChooseUs() {
  return (
    <section className="container-page py-14">
      <SectionHeader title="Why Choose EA Computers" subtitle="What sets us apart" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {REASONS.map((reason, i) => (
          <div
            key={reason.title}
            style={{ animationDelay: `${i * 80}ms` }}
            className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 opacity-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
          >
            <h3 className="mb-1.5 font-semibold text-slate-900">{reason.title}</h3>
            <p className="text-sm text-slate-500">{reason.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
