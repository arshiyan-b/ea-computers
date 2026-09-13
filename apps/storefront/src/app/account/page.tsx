'use client';

import Link from 'next/link';
import { RequireAuth } from '@/components/RequireAuth';
import { useAuthStore } from '@/store/auth-store';

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountContent />
    </RequireAuth>
  );
}

function AccountContent() {
  const user = useAuthStore((s) => s.user)!;
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My Account</h1>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-800">{user.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-800">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Account Type</dt>
            <dd className="font-medium text-slate-800">{user.role === 'ADMIN' ? 'Administrator' : 'Customer'}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/account/orders"
          className="flex-1 rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-medium text-slate-700 hover:border-brand-300 hover:text-brand-700"
        >
          View Order History
        </Link>
        <button
          onClick={logout}
          className="flex-1 rounded-xl border border-slate-200 bg-white p-4 text-center text-sm font-medium text-red-600 hover:border-red-200 hover:bg-red-50"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
