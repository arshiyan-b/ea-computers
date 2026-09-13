'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    useAuthStore.getState().init();
  }, []);

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/login');
    }
  }, [isInitialized, user, router]);

  if (!isInitialized || !user) {
    return (
      <div className="container-page py-16">
        <div className="mx-auto h-8 w-48 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  return <>{children}</>;
}
