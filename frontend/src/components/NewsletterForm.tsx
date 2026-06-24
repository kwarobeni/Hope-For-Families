import { useState } from 'react';
import { API_URL } from '../lib/api';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${API_URL}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return <p className="text-sm text-gold">Thanks for subscribing!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="field-input min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-emerald"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        aria-label="Subscribe"
        className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-gold disabled:opacity-60"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14543A" strokeWidth="2.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
      {status === 'error' && <p className="mt-1 text-xs text-red-400">Something went wrong, please try again.</p>}
    </form>
  );
}
