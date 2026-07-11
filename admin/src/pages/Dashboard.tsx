import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [rebuildStatus, setRebuildStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [rebuildMsg, setRebuildMsg] = useState('');

  useEffect(() => {
    Promise.all([
      apiClient.get<any[]>('/volunteers'),
      apiClient.get<any[]>('/newsletter'),
      apiClient.get<any[]>('/events'),
      apiClient.get<any[]>('/posts/admin'),
    ]).then(([volunteers, newsletter, events, posts]) => {
      setCounts({
        volunteers: volunteers.length,
        newsletter: newsletter.length,
        events: events.length,
        posts: posts.length,
      });
    });
  }, []);

  async function handleRebuild() {
    setRebuildStatus('loading');
    setRebuildMsg('');
    try {
      const data = await apiClient.post<{ message: string }>('/admin/rebuild', {});
      setRebuildStatus('done');
      setRebuildMsg(data.message);
    } catch (err: any) {
      setRebuildStatus('error');
      setRebuildMsg(err.message || 'Rebuild failed. Check GITHUB_PAT is set in Hostinger env vars.');
    }
  }

  const cards = [
    { label: 'Volunteer Applications', value: counts.volunteers, to: '/volunteers', accent: 'bg-mint-tint text-emerald-deep' },
    { label: 'Newsletter Subscribers', value: counts.newsletter, to: '/newsletter', accent: 'bg-gold-tint text-gold-deep' },
    { label: 'Events', value: counts.events, to: '/events', accent: 'bg-blue-tint text-hope-blue' },
    { label: 'Blog Posts', value: counts.posts, to: '/posts', accent: 'bg-mint-tint text-emerald-deep' },
  ];

  return (
    <div>
      <h1 className="mb-1.5 font-display text-2xl font-bold text-forest-900">Welcome, {user?.name}</h1>
      <p className="mb-8 text-muted">Manage your site content, events, and donors from here.</p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.to} className="card-lift block rounded-2xl border border-border-soft bg-white p-5 shadow-[0_14px_34px_-28px_rgba(20,84,58,0.4)]">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-bold ${card.accent}`}>
              {card.value ?? '—'}
            </div>
            <div className="font-display text-3xl font-extrabold text-forest-900">{card.value ?? '—'}</div>
            <div className="mt-1 text-sm text-muted">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Rebuild Site */}
      <div className="mt-10 rounded-2xl border border-border-soft bg-mint p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-forest-900">Publish content changes</h2>
            <p className="mt-1 text-sm text-muted">
              After adding or editing blog posts, events, testimonials or programs, click here to rebuild
              and publish the live website. Takes about 2–3 minutes.
            </p>
            {rebuildMsg && (
              <p className={`mt-2 text-sm font-medium ${rebuildStatus === 'error' ? 'text-red-600' : 'text-emerald-deep'}`}>
                {rebuildMsg}
              </p>
            )}
          </div>
          <button
            onClick={handleRebuild}
            disabled={rebuildStatus === 'loading'}
            className="shrink-0 rounded-full bg-emerald-deep px-6 py-3 font-display text-sm font-bold text-white shadow-[0_8px_20px_-10px_rgba(20,84,58,0.5)] disabled:opacity-60"
          >
            {rebuildStatus === 'loading' ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Rebuilding…
              </span>
            ) : (
              'Rebuild Site'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
