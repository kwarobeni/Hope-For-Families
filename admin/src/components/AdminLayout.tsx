import { useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/posts', label: 'Blog Posts' },
  { to: '/initiatives', label: 'Initiatives' },
  { to: '/programs', label: 'Programs' },
  { to: '/events', label: 'Events' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/volunteers', label: 'Volunteers' },
  { to: '/newsletter', label: 'Newsletter' },
  { to: '/donations', label: 'Donations' },
  { to: '/impact-stats', label: 'Impact Stats' },
  { to: '/resources', label: 'Resources' },
  { to: '/settings', label: 'Site Settings' },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  if (loading) return <div className="p-8 text-body">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
      isActive ? 'bg-emerald-deep text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen bg-mint">
      {/* mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-forest-900 px-4 py-3.5 lg:hidden">
        <div className="flex items-center gap-1.5">
          <span className="text-xl leading-none text-white" style={{ fontFamily: 'var(--font-script)' }}>hope</span>
          <span className="self-center text-[8px] font-semibold tracking-[0.3em] text-white/60">ADMIN</span>
        </div>
        <button
          onClick={() => setNavOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>

      {/* mobile overlay */}
      {navOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setNavOpen(false)} />
      )}

      {/* sidebar: off-canvas drawer on mobile, static column on lg+ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-forest-900 transition-transform lg:static lg:translate-x-0 ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl leading-none text-white" style={{ fontFamily: 'var(--font-script)' }}>hope</span>
            <svg width="13" height="13" viewBox="0 0 24 24" className="mb-1">
              <path fill="#F4B942" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z" />
            </svg>
            <span className="ml-1 self-center text-[8px] font-semibold tracking-[0.3em] text-white/60">ADMIN</span>
          </div>
          <button onClick={() => setNavOpen(false)} aria-label="Close menu" className="text-white/70 lg:hidden">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'} onClick={() => setNavOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          {user.role === 'super_admin' && (
            <NavLink to="/users" className={linkClass} onClick={() => setNavOpen(false)}>
              Staff Accounts
            </NavLink>
          )}
        </nav>
        <div className="border-t border-white/10 p-4 text-sm">
          <p className="font-semibold text-white">{user.name}</p>
          <p className="text-xs capitalize text-white/50">{user.role.replace('_', ' ')}</p>
          <button onClick={logout} className="mt-3 font-semibold text-gold hover:text-gold-deep">
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-5 pt-20 lg:p-8 lg:pt-8">
        <Outlet />
      </main>
    </div>
  );
}
