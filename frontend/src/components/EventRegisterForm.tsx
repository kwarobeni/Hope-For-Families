import { useState } from 'react';
import { API_URL } from '../lib/api';

export default function EventRegisterForm({ eventId }: { eventId: number }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    try {
      const res = await fetch(`${API_URL}/events/${eventId}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Registration failed');
      }
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-xl border border-mint-tint bg-mint-tint p-6 text-emerald-deep">
        You're registered! A confirmation email is on its way.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-sm font-semibold text-forest-900">Full Name</label>
        <input required value={form.name} onChange={update('name')} className="field-input w-full rounded-xl border-[1.5px] border-border-warm bg-white px-4 py-2.5" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-forest-900">Email</label>
        <input type="email" required value={form.email} onChange={update('email')} className="field-input w-full rounded-xl border-[1.5px] border-border-warm bg-white px-4 py-2.5" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-forest-900">Phone</label>
        <input value={form.phone} onChange={update('phone')} className="field-input w-full rounded-xl border-[1.5px] border-border-warm bg-white px-4 py-2.5" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-forest-900">Notes (optional)</label>
        <textarea value={form.notes} onChange={update('notes')} rows={3} className="field-input w-full rounded-xl border-[1.5px] border-border-warm bg-white px-4 py-2.5" />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-lift rounded-full bg-emerald-deep px-6 py-3 font-display text-sm font-bold text-white disabled:opacity-60"
      >
        {status === 'loading' ? 'Registering...' : 'Register for Event'}
      </button>
      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
