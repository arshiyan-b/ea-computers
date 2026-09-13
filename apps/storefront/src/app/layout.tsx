import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/Toaster';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'EA Computers — Laptops, PCs & Tech Hardware in Pakistan',
    template: '%s | EA Computers',
  },
  description:
    'Shop laptops, desktop PCs, graphics cards, processors and computer accessories in Pakistan. Genuine products, competitive prices, Cash on Delivery.',
  openGraph: {
    type: 'website',
    siteName: 'EA Computers',
    title: 'EA Computers — Laptops, PCs & Tech Hardware in Pakistan',
    description:
      'Shop laptops, desktop PCs, graphics cards, processors and computer accessories in Pakistan.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
