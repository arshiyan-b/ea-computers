'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-lg font-semibold text-slate-800">Something went wrong</h1>
      <p className="mt-1 max-w-sm text-sm text-slate-500">
        We couldn&apos;t load this page. Please try again, or head back to the homepage.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
      >
        Try again
      </button>
    </div>
  );
}
