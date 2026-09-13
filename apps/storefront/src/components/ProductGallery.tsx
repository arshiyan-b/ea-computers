'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ProductImage } from '@/types/api';

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {active ? (
          <Image
            src={active.url}
            alt={active.alt ?? productName}
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-slate-300">No image available</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border ${
                i === activeIndex ? 'border-brand-600 ring-1 ring-brand-600' : 'border-slate-200'
              }`}
            >
              <Image src={img.url} alt={img.alt ?? productName} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
