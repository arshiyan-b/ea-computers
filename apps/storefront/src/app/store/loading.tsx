import { ProductGridSkeleton } from '@/components/Skeletons';

export default function Loading() {
  return (
    <div className="container-page py-8">
      <div className="mb-6 h-8 w-64 animate-pulse rounded bg-slate-100" />
      <ProductGridSkeleton count={12} />
    </div>
  );
}
