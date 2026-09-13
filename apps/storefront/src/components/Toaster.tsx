'use client';

import clsx from 'clsx';
import { useToastStore } from '@/store/toast-store';

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={clsx(
            'flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg',
            toast.variant === 'success' && 'border-green-200 bg-green-50 text-green-800',
            toast.variant === 'error' && 'border-red-200 bg-red-50 text-red-800',
            toast.variant === 'info' && 'border-slate-200 bg-white text-slate-800',
          )}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss notification"
            className="text-current/60 hover:text-current"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
