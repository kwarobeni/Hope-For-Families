import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(155deg,#3FAE68_0%,#1F7A4D_70%,#176B43_100%)] px-4">
      <div className="pointer-events-none absolute -right-28 -top-20 h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle,rgba(244,185,66,0.32),transparent_68%)]" />
      <div className="pointer-events-none absolute -left-24 -bottom-16 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(31,90,166,0.3),transparent_70%)]" />

      <form onSubmit={handleSubmit} className="relative w-full max-w-sm space-y-5 rounded-[24px] bg-white p-9 shadow-[0_30px_60px_-28px_rgba(0,0,0,0.45)]">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <img src="/images/logo-full.png" alt="Hope For Families" className="h-16 w-auto" />
          <span className="text-[9px] font-semibold tracking-[0.3em] text-muted">ADMIN PORTAL</span>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest-900">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input w-full rounded-xl border-[1.5px] border-border-warm px-4 py-2.5"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest-900">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input w-full rounded-xl border-[1.5px] border-border-warm px-4 py-2.5"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-deep py-3 font-display font-bold text-white shadow-[0_16px_30px_-14px_rgba(46,139,87,0.6)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}
