'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { checkout } from '@/lib/checkout';
import { formatPKR } from '@/lib/format';
import { ApiError } from '@/lib/api';
import { EmptyState } from '@/components/EmptyState';
import type { Order } from '@/types/api';

interface FormState {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  shippingAddress: '',
  city: '',
  notes: '',
};

export default function CheckoutPage() {
  const { cart, refresh } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, customerName: f.customerName || user.name, customerEmail: f.customerEmail || user.email }));
    }
  }, [user]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const created = await checkout({
        ...form,
        notes: form.notes || undefined,
      });
      setOrder(created);
      useCartStore.setState({ cart: null, itemCount: 0 });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors({ form: err.message });
      } else {
        setErrors({ form: 'Something went wrong placing your order. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (order) {
    return <OrderConfirmation order={order} />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState
          title="Your cart is empty"
          description="Add some products before checking out."
          actionHref="/products"
          actionLabel="Start Shopping"
        />
      </div>
    );
  }

  return (
    <div className="container-page py-12">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Shipping Details</h2>

            {errors.form && (
              <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" required>
                <input
                  required
                  value={form.customerName}
                  onChange={(e) => update('customerName', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  required
                  value={form.customerEmail}
                  onChange={(e) => update('customerEmail', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Phone" required>
                <input
                  required
                  placeholder="+92 3XX XXXXXXX"
                  value={form.customerPhone}
                  onChange={(e) => update('customerPhone', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="City" required>
                <input
                  required
                  value={form.city}
                  onChange={(e) => update('city', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Address" required className="sm:col-span-2">
                <textarea
                  required
                  rows={2}
                  value={form.shippingAddress}
                  onChange={(e) => update('shippingAddress', e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Additional Notes" className="sm:col-span-2">
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => update('notes', e.target.value)}
                  className="input"
                  placeholder="e.g. call before delivery"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-2 text-base font-semibold text-slate-900">Payment Method</h2>
            <div className="flex items-center gap-3 rounded-md border border-brand-200 bg-brand-50 px-4 py-3">
              <input type="radio" checked readOnly />
              <div>
                <p className="text-sm font-medium text-slate-800">Cash on Delivery</p>
                <p className="text-xs text-slate-500">
                  Pay in cash when your order arrives. Online payment isn&apos;t available yet.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-brand-700 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60 lg:hidden"
          >
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
        </form>

        <div className="h-fit rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Order Summary</h2>
          <ul className="mb-4 space-y-2 divide-y divide-slate-100">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between pt-2 text-sm first:pt-0">
                <span className="text-slate-600">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium text-slate-800">{formatPKR(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-1 border-t border-slate-200 pt-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatPKR(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900">
              <span>Total</span>
              <span>{formatPKR(cart.total)}</span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-6 hidden w-full rounded-md bg-brand-700 py-3 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60 lg:block"
          >
            {submitting ? 'Placing order…' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block text-sm ${className ?? ''}`}>
      <span className="mb-1 block font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function OrderConfirmation({ order }: { order: Order }) {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-xl rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-100 text-2xl text-green-600">
          ✓
        </div>
        <h1 className="text-xl font-bold text-slate-900">Order placed successfully!</h1>
        <p className="mt-1 text-sm text-slate-600">
          Thank you, {order.customerName}. We&apos;ll contact you at {order.customerPhone} to confirm delivery.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          Order Number: <span className="font-mono font-semibold text-slate-800">{order.id}</span>
        </p>

        <div className="mt-6 rounded-lg border border-green-100 bg-white p-4 text-left">
          <ul className="space-y-1.5 divide-y divide-slate-100 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between pt-1.5 first:pt-0">
                <span className="text-slate-600">
                  {item.productName} × {item.quantity}
                </span>
                <span className="font-medium text-slate-800">{formatPKR(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm font-bold text-slate-900">
            <span>Total</span>
            <span>{formatPKR(order.total)}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Link href="/products" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white">
            Continue Shopping
          </Link>
          <Link href="/account/orders" className="rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800">
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
