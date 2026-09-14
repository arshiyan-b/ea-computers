'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface Slide {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  image: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: "Pakistan's Tech Hardware Store",
    title: (
      <>
        Build. Upgrade. <span className="text-brand-400">Game harder.</span>
      </>
    ),
    description:
      'Genuine laptops, desktop PCs, graphics cards and components — competitively priced, with Cash on Delivery available nationwide.',
    primaryCta: { label: 'Shop All Products', href: '/products' },
    secondaryCta: { label: 'Browse Graphics Cards', href: '/categories/graphics-cards' },
    image: 'https://picsum.photos/seed/ea-computers-hero/1600/900',
  },
  {
    eyebrow: 'New Arrivals',
    title: (
      <>
        Laptops built for <span className="text-brand-400">work and play</span>
      </>
    ),
    description:
      'From slim ultrabooks to full-power gaming rigs — find a laptop that fits your workload and your budget.',
    primaryCta: { label: 'Shop Laptops', href: '/categories/laptops' },
    image: 'https://picsum.photos/seed/ea-computers-laptops/1600/900',
  },
  {
    eyebrow: 'Ready to Ship',
    title: (
      <>
        Pre-built desktops, <span className="text-brand-400">tested and ready</span>
      </>
    ),
    description:
      'Skip the build — get a fully assembled, benchmark-tested desktop PC delivered straight to your door.',
    primaryCta: { label: 'Shop Desktop PCs', href: '/categories/desktop-pcs' },
    image: 'https://picsum.photos/seed/ea-computers-desktop/1600/900',
  },
  {
    eyebrow: 'Limited-Time',
    title: (
      <>
        Deals you don&apos;t want to <span className="text-brand-400">miss</span>
      </>
    ),
    description:
      'Hand-picked discounts on flagship hardware — while stocks last. New deals added regularly.',
    primaryCta: { label: 'View Deals', href: '/products' },
    image: 'https://picsum.photos/seed/ea-computers-deals/1600/900',
  },
  {
    eyebrow: 'Complete Your Setup',
    title: (
      <>
        Monitors, keyboards <span className="text-brand-400">& more</span>
      </>
    ),
    description:
      'High-refresh monitors, mechanical keyboards and precision mice — everything that belongs around your PC.',
    primaryCta: { label: 'Shop Monitors', href: '/categories/monitors' },
    image: 'https://picsum.photos/seed/ea-computers-monitors/1600/900',
  },
  {
    eyebrow: 'Nationwide Delivery',
    title: (
      <>
        Genuine products. <span className="text-brand-400">Cash on Delivery.</span>
      </>
    ),
    description:
      'Every item ships with full manufacturer warranty — pay in cash only when it arrives at your door.',
    primaryCta: { label: 'Start Shopping', href: '/products' },
    image: 'https://picsum.photos/seed/ea-computers-delivery/1600/900',
  },
];

const AUTOPLAY_MS = 5500;

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setActive(((index % SLIDES.length) + SLIDES.length) % SLIDES.length);
  }, []);

  // Depends only on `paused` — a single interval lives for as long as
  // autoplay is active, advancing via a functional update rather than
  // recreating itself (and restarting the 5.5s wait) on every tick or
  // manual `goTo`.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section
      className="relative h-[440px] overflow-hidden bg-slate-900 text-white sm:h-[500px] lg:h-[600px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          aria-hidden={i !== active}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === active ? 'z-10 opacity-100' : 'z-0 opacity-0'
          }`}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-slate-900/20" />

          <div className="container-page relative flex h-full items-center">
            <div className="max-w-xl">
              <span
                className={`mb-4 inline-block w-fit rounded-full bg-brand-600/20 px-3 py-1 text-xs font-semibold text-brand-300 ${
                  i === active ? 'animate-fade-in-up' : ''
                }`}
              >
                {slide.eyebrow}
              </span>
              <h1
                className={`mb-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl ${
                  i === active ? 'animate-fade-in-up [animation-delay:80ms]' : ''
                }`}
              >
                {slide.title}
              </h1>
              <p
                className={`mb-6 max-w-lg text-slate-300 ${
                  i === active ? 'animate-fade-in-up [animation-delay:160ms]' : ''
                }`}
              >
                {slide.description}
              </p>
              <div
                className={`flex flex-wrap gap-3 ${
                  i === active ? 'animate-fade-in-up [animation-delay:240ms]' : ''
                }`}
              >
                <Link
                  href={slide.primaryCta.href}
                  className="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-600/30 active:translate-y-0"
                >
                  {slide.primaryCta.label}
                </Link>
                {slide.secondaryCta && (
                  <Link
                    href={slide.secondaryCta.href}
                    className="rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0"
                  >
                    {slide.secondaryCta.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next controls — hidden on small screens, where they'd overlap the slide text; dots still work there */}
      <button
        onClick={() => goTo(active - 1)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 active:scale-90 md:grid lg:left-6"
      >
        <ChevronIcon direction="left" />
      </button>
      <button
        onClick={() => goTo(active + 1)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 active:scale-90 md:grid lg:right-6"
      >
        <ChevronIcon direction="right" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === active}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" stroke="currentColor" strokeWidth="2">
      <path
        d={direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
