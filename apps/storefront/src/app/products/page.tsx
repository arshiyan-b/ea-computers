import { redirect } from 'next/navigation';

interface Props {
  searchParams: Record<string, string | undefined>;
}

export default function ProductsRedirectPage({ searchParams }: Props) {
  const qs = new URLSearchParams(
    Object.entries(searchParams).filter((entry): entry is [string, string] => entry[1] !== undefined)
  ).toString();
  redirect(qs ? `/store?${qs}` : '/store');
}
