const currencyFormatter = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
});

export function formatPKR(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value;
  return currencyFormatter.format(Number.isFinite(n) ? n : 0);
}

export function formatDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}
