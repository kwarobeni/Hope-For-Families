import { useState } from 'react';
import { API_URL } from '../lib/api';

export default function VolunteerForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', area_of_interest: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-xl border border-mint-tint bg-mint-tint p-6 text-emerald-deep">
        Thank you for applying to volunteer! We'll be in touch soon.
      </div>
    );
  }

  const fieldClass = 'field-input w-full rounded-xl border-[1.5px] border-border-warm bg-white px-4 py-2.5 text-forest-900';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest-900">Full Name</label>
          <input required value={form.name} onChange={update('name')} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest-900">Email</label>
          <input type="email" required value={form.email} onChange={update('email')} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest-900">Phone</label>
          <input value={form.phone} onChange={update('phone')} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest-900">I'm interested in&hellip;</label>
          <select value={form.area_of_interest} onChange={update('area_of_interest')} className={fieldClass}>
            <option value="">Select an area</option>
            <option>Mentoring young people</option>
            <option>Community events</option>
            <option>Food bank & café</option>
            <option>Football academy</option>
            <option>Admin & behind the scenes</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest-900">
            Anything you'd like us to know? <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea value={form.message} onChange={update('message')} rows={4} className={`${fieldClass} resize-none`} />
        </div>
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn-lift w-full rounded-xl bg-emerald-deep px-6 py-4 font-display text-base font-bold text-white shadow-[0_16px_30px_-14px_rgba(46,139,87,0.6)] disabled:opacity-60"
      >
        {status === 'loading' ? 'Submitting...' : 'Send my interest'}
      </button>
      {status === 'error' && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
    </form>
  );
}
