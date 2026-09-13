import Link from 'next/link';
import Image from 'next/image';
import { listProducts } from '@/lib/products';
import { listCategories } from '@/lib/categories';
import { listBrands } from '@/lib/brands';
import { ProductCard } from '@/components/ProductCard';

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
      <Hero />

      <section className="container-page py-12">
        <SectionHeader title="Shop by Category" subtitle="Find exactly what your build needs" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.data.slice(0, 12).map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-lg font-bold text-brand-700">
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
            {featured.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {bestSellers.data.length > 0 && (
        <section className="bg-white py-12">
          <div className="container-page">
            <SectionHeader title="Best Sellers" subtitle="Our customers' favorite high-performance gear" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {bestSellers.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {deals.data.length > 0 && (
        <section className="container-page py-12">
          <SectionHeader title="Deals" subtitle="Limited-time price drops" href="/products" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {deals.data.map((product) => (
              <ProductCard key={product.id} product={product} />
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
            {brands.data.map((brand) => (
              <span key={brand.id} className="text-lg font-bold text-slate-400 hover:text-slate-700">
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

function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-900 text-white">
      <div className="container-page grid gap-8 py-16 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col justify-center gap-5">
          <span className="w-fit rounded-full bg-brand-600/20 px-3 py-1 text-xs font-semibold text-brand-300">
            Pakistan&apos;s Tech Hardware Store
          </span>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            Build. Upgrade. <span className="text-brand-400">Game harder.</span>
          </h1>
          <p className="max-w-lg text-slate-300">
            Genuine laptops, desktop PCs, graphics cards and components — competitively priced,
            with Cash on Delivery available nationwide.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-500"
            >
              Shop All Products
            </Link>
            <Link
              href="/categories/graphics-cards"
              className="rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Browse Graphics Cards
            </Link>
          </div>
        </div>
        <div className="relative hidden lg:block">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-brand-600/30 to-transparent blur-2xl" />
          <Image
            src="https://picsum.photos/seed/ea-computers-hero/900/700"
            alt="High-performance gaming PC build"
            width={900}
            height={700}
            priority
            className="rounded-3xl object-cover shadow-2xl"
          />
        </div>
      </div>
    </section>
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
        {REASONS.map((reason) => (
          <div key={reason.title} className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-1.5 font-semibold text-slate-900">{reason.title}</h3>
            <p className="text-sm text-slate-500">{reason.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
