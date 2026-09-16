'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RequireAuth } from '@/components/RequireAuth';
import { EmptyState } from '@/components/EmptyState';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { listMyOrders } from '@/lib/orders';
import { formatDate, formatPKR } from '@/lib/format';
import type { Order } from '@/types/api';

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersContent />
    </RequireAuth>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMyOrders({ limit: 50 })
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load orders'));
  }, []);

  return (
    <div className="container-page py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Order History</h1>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {orders === null && !error && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      )}

      {orders && orders.length === 0 && (
        <EmptyState
          title="No orders yet"
          description="Once you place an order, it will show up here."
          actionHref="/store"
          actionLabel="Start Shopping"
        />
      )}

      {orders && orders.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{order.id.slice(0, 10)}…</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-800">{formatPKR(order.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/account/orders/${order.id}`} className="text-brand-700 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
