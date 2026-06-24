import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});

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
    </div>
  );
}
