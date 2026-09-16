import Link from 'next/link';
import { listProducts } from '@/lib/products';
import { listCategories } from '@/lib/categories';
import { listBrands } from '@/lib/brands';
import { ProductCard } from '@/components/ProductCard';
import { HeroSlider } from '@/components/HeroSlider';
import { ContactForm } from '@/components/ContactForm';

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

      <AboutSection />
      <ServicesSection />
      <TeamSection />
      <TestimonialsSection />
      <CustomersSection />

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
            href="/store?featured=true"
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
          <SectionHeader title="Deals" subtitle="Limited-time price drops" href="/store" />
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
      <ContactCta />
    </div>
  );
}

function AboutSection() {
  return (
    <section id="about" className="scroll-mt-16 bg-white py-16">
      <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="animate-fade-in-up opacity-0">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-700">About Us</p>
          <h2 className="mb-4 text-2xl font-bold text-slate-900 sm:text-3xl">
            EA Computers — networking and IT solutions built for business
          </h2>
          <p className="mb-4 text-slate-600">
            For over a decade, EA Computers has helped firms across Pakistan design, deploy and
            maintain the networking and IT infrastructure their operations depend on. What started as
            a hardware supplier has grown into a full-service technology partner — from structured
            cabling and enterprise Wi-Fi to server rooms and managed support contracts.
          </p>
          <p className="text-slate-600">
            We combine hands-on networking expertise with a genuine hardware supply chain, so
            businesses get one accountable partner for both the equipment and the engineering behind
            it.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
            {[
              { value: '12+', label: 'Years in business' },
              { value: '400+', label: 'Firms served' },
              { value: '1,200+', label: 'Networks deployed' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-bold text-brand-700">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div
          className="animate-fade-in-up opacity-0 [animation-delay:120ms]"
          style={{ animationFillMode: 'both' }}
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Reliable', desc: 'Uptime-first network design and monitoring' },
              { title: 'Certified', desc: 'Trained, vendor-certified engineers' },
              { title: 'Accountable', desc: 'A single partner for hardware and support' },
              { title: 'Local', desc: 'On-site response across major cities' },
            ].map((item, i) => (
              <div
                key={item.title}
                style={{ animationDelay: `${160 + i * 80}ms` }}
                className="animate-fade-in-up rounded-xl border border-slate-200 bg-slate-50 p-5 opacity-0 transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-slate-200/60"
              >
                <h3 className="mb-1 font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const SERVICES = [
  {
    title: 'Network Infrastructure',
    description: 'Structured cabling, switching and enterprise Wi-Fi designed for reliability at scale.',
  },
  {
    title: 'IT Consultancy & Support',
    description: 'Ongoing advice and managed support contracts that keep your systems running.',
  },
  {
    title: 'Server & Cloud Setup',
    description: 'On-premise server rooms, backup systems and hybrid cloud deployments.',
  },
  {
    title: 'Security & Surveillance',
    description: 'Firewalls, access control and CCTV integrated with your network.',
  },
  {
    title: 'Hardware Procurement',
    description: 'Bulk sourcing of genuine laptops, desktops and networking gear for your office.',
  },
  {
    title: 'On-Site Maintenance',
    description: 'Scheduled maintenance and rapid-response troubleshooting from local engineers.',
  },
];

function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-16 bg-slate-50 py-16">
      <div className="container-page">
        <SectionHeader
          title="What We Do"
          subtitle="Networking and IT solutions tailored to your firm's operations"
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <div
              key={service.title}
              style={{ animationDelay: `${i * 70}ms` }}
              className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 opacity-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
            >
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <NetworkIcon />
              </div>
              <h3 className="mb-1.5 font-semibold text-slate-900">{service.title}</h3>
              <p className="text-sm text-slate-500">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NetworkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path d="M12 7.5V13m0 0-5.5 4M12 13l5.5 4" strokeLinecap="round" />
    </svg>
  );
}

const TEAM = [
  { name: 'Ahmed Ali', role: 'Founder & CEO', initials: 'AA' },
  { name: 'Sara Khan', role: 'Head of Network Engineering', initials: 'SK' },
  { name: 'Bilal Ahmed', role: 'IT Support Manager', initials: 'BA' },
  { name: 'Hina Raza', role: 'Client Relations Lead', initials: 'HR' },
];

function TeamSection() {
  return (
    <section id="team" className="scroll-mt-16 bg-white py-16">
      <div className="container-page">
        <SectionHeader title="Our Team" subtitle="The engineers and consultants behind every deployment" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((member, i) => (
            <div
              key={member.name}
              style={{ animationDelay: `${i * 80}ms` }}
              className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-6 text-center opacity-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
            >
              <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-brand-700 text-lg font-bold text-white transition-transform duration-200 hover:scale-110">
                {member.initials}
              </span>
              <h3 className="font-semibold text-slate-900">{member.name}</h3>
              <p className="text-sm text-slate-500">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote:
      'EA Computers rewired our entire office network over a weekend with zero downtime on Monday. Their team clearly knows enterprise networking.',
    name: 'Faisal Mahmood',
    role: 'Operations Director, Horizon Textiles',
  },
  {
    quote:
      'We rely on their managed support contract for three branch offices. Response times are fast and the engineers actually explain what went wrong.',
    name: 'Ayesha Siddiqui',
    role: 'IT Manager, Crestline Logistics',
  },
  {
    quote:
      'From procuring laptops to setting up our server room, EA Computers has been the one vendor we never have to double-check.',
    name: 'Omar Farooq',
    role: 'CFO, Farooq & Partners',
  },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="scroll-mt-16 bg-slate-50 py-16">
      <div className="container-page">
        <SectionHeader title="What Our Clients Say" subtitle="Feedback from the firms we work with" />
        <div className="grid gap-6 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={t.name}
              style={{ animationDelay: `${i * 90}ms` }}
              className="animate-fade-in-up flex flex-col rounded-xl border border-slate-200 bg-white p-6 opacity-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
            >
              <QuoteIcon />
              <blockquote className="mb-4 flex-1 text-sm leading-relaxed text-slate-600">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption>
                <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="mb-3 text-brand-200">
      <path d="M9.5 7C6.5 7 4 9.5 4 12.5V18h6v-6H7c0-2 1.5-3.5 3.5-3.5V7h-1zm9 0c-3 0-5.5 2.5-5.5 5.5V18h6v-6h-3c0-2 1.5-3.5 3.5-3.5V7h-1z" />
    </svg>
  );
}

const CUSTOMERS = [
  'Horizon Textiles',
  'Crestline Logistics',
  'Farooq & Partners',
  'Meridian Bank',
  'Alpine Pharmaceuticals',
  'Vantage Realty Group',
  'Northbridge Insurance',
  'Falcon Freight Co.',
];

function CustomersSection() {
  return (
    <section id="customers" className="scroll-mt-16 border-y border-slate-200 bg-white py-10">
      <div className="container-page">
        <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-slate-400">
          Firms That Trust EA Computers
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {CUSTOMERS.map((name, i) => (
            <span
              key={name}
              style={{ animationDelay: `${i * 30}ms` }}
              className="animate-fade-in text-base font-semibold text-slate-400 opacity-0 transition-all duration-200 hover:scale-110 hover:text-slate-700"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactCta() {
  return (
    <section id="contact" className="scroll-mt-16 bg-slate-900 py-16 text-white">
      <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="animate-fade-in-up opacity-0">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-300">Get in Touch</p>
          <h2 className="mb-4 text-2xl font-bold sm:text-3xl">
            Ready to upgrade your firm&apos;s network?
          </h2>
          <p className="mb-6 max-w-xl text-slate-300">
            Talk to our team about network design, IT support contracts, or bulk hardware for your
            office — tell us what you need below and a consultant will get back to you, or browse
            the shop for ready-to-ship hardware.
          </p>
          <Link
            href="/store"
            className="inline-block rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0"
          >
            Browse the Shop
          </Link>
        </div>
        <div className="animate-fade-in-up opacity-0 [animation-delay:120ms]" style={{ animationFillMode: 'both' }}>
          <ContactForm />
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
