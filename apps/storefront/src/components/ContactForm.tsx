'use client';

import { useState } from 'react';
import { submitLead } from '@/lib/leads';
import { ApiError } from '@/lib/api';

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

const EMPTY_FORM: FormState = { name: '', email: '', phone: '', company: '', message: '' };

export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        company: form.company || undefined,
        message: form.message,
      });
      setSent(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="animate-scale-in rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <h3 className="mb-1 font-semibold text-green-800">Thanks — we&apos;ve got your message</h3>
        <p className="text-sm text-green-700">
          One of our consultants will get back to you shortly.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-4 text-sm font-medium text-green-800 underline hover:no-underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-left">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" required>
          <input
            required
            maxLength={150}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Email" required>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Phone">
          <input
            placeholder="+92 3XX XXXXXXX"
            maxLength={30}
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Company">
          <input
            maxLength={150}
            value={form.company}
            onChange={(e) => update('company', e.target.value)}
            className="input"
          />
        </Field>
      </div>

      <Field label="How can we help?" required>
        <textarea
          required
          rows={4}
          minLength={10}
          maxLength={2000}
          placeholder="Tell us about your firm's networking or IT needs..."
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
          className="input resize-none"
        />
      </Field>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-brand-600 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-600/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
