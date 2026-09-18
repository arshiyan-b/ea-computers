'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RequireAuth } from '@/components/RequireAuth';
import { OrderStatusBadge } from '@/components/OrderStatusBadge';
import { getMyOrder } from '@/lib/orders';
import { formatDate, formatPKR } from '@/lib/format';
import type { Order } from '@/types/api';

export default function OrderDetailPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <OrderDetailContent />
      </Suspense>
    </RequireAuth>
  );
}

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getMyOrder(id)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load order'));
  }, [id]);

  if (error) {
    return (
      <div className="container-page py-12">
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-12">
        <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Order #{order.id.slice(0, 10)}…</h1>
          <p className="text-sm text-slate-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Shipping Information</h2>
          <dl className="space-y-1 text-sm text-slate-600">
            <div>{order.customerName}</div>
            <div>{order.customerPhone}</div>
            <div>{order.customerEmail}</div>
            <div>
              {order.shippingAddress}, {order.city}
            </div>
            {order.notes && <div className="italic text-slate-400">&quot;{order.notes}&quot;</div>}
          </dl>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Payment</h2>
          <p className="text-sm text-slate-600">Cash on Delivery</p>
          <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatPKR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900">
              <span>Total</span>
              <span>{formatPKR(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-slate-700">{item.productName}</td>
                <td className="px-4 py-3 text-right text-slate-600">{formatPKR(item.price)}</td>
                <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-800">{formatPKR(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
