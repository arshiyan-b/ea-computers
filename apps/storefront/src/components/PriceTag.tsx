import { formatPKR } from '@/lib/format';

export function PriceTag({
  price,
  compareAtPrice,
  size = 'md',
}: {
  price: string | number;
  compareAtPrice?: string | number | null;
  size?: 'sm' | 'md' | 'lg';
}) {
  const hasDiscount = compareAtPrice && Number(compareAtPrice) > Number(price);
  const sizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-bold text-slate-900 ${sizes[size]}`}>{formatPKR(price)}</span>
      {hasDiscount && (
        <span className="text-sm text-slate-400 line-through">{formatPKR(compareAtPrice!)}</span>
      )}
    </div>
  );
}
