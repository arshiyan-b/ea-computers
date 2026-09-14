function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Shimmer className="aspect-square w-full" />
      <div className="space-y-2 p-4">
        <Shimmer className="h-3 w-1/3 rounded" />
        <Shimmer className="h-4 w-full rounded" />
        <Shimmer className="h-4 w-2/3 rounded" />
        <Shimmer className="h-8 w-full rounded" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ animationDelay: `${i * 40}ms` }} className="animate-fade-in opacity-0">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}
