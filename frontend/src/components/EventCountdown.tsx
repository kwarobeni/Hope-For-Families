import { useState, useEffect } from 'react';
import { API_URL } from '../lib/api';

interface EventItem {
  id: number;
  title: string;
  start_at: string;
  location: string | null;
}

// Fallback events shown if the DB has fewer than 2 future events
const FALLBACK_EVENTS = [
  {
    title: 'Hope For Families Summer BBQ Festival',
    start_at: '2026-08-08T12:00:00',
    label: 'Saturday, 8 August 2026',
    accent: 'gold' as const,
    image: '/images/moment-3.jpg',
  },
  {
    title: 'Christmas Afroball',
    start_at: '2026-12-12T19:00:00',
    label: 'Saturday, 12 December 2026',
    accent: 'blue' as const,
    image: '/images/moment-1.jpg',
  },
];

function formatLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

function Tile({ value, label, accent }: { value: number; label: string; accent: 'gold' | 'blue' }) {
  return (
    <div className="flex flex-col items-center rounded-[14px] bg-white px-2 py-3 shadow-sm">
      <span className={`font-display text-2xl font-extrabold leading-none ${accent === 'gold' ? 'text-forest-900' : 'text-hope-blue'}`}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</span>
    </div>
  );
}

export default function EventCountdown() {
  const [ready, setReady] = useState(false);
  const [, setTick] = useState(0);
  const [displayEvents, setDisplayEvents] = useState<typeof FALLBACK_EVENTS>(FALLBACK_EVENTS);

  useEffect(() => {
    setReady(true);
    const id = setInterval(() => setTick((t) => t + 1), 1000);

    // Fetch real upcoming events and replace fallbacks with up to 2 of them
    fetch(`${API_URL}/events`)
      .then((r) => r.json())
      .then((events: EventItem[]) => {
        const now = Date.now();
        const upcoming = events
          .filter((e) => new Date(e.start_at).getTime() > now)
          .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
          .slice(0, 2);

        if (upcoming.length > 0) {
          const accents: Array<'gold' | 'blue'> = ['gold', 'blue'];
          const images = ['/images/moment-3.jpg', '/images/moment-1.jpg'];
          setDisplayEvents(
            upcoming.map((e, i) => ({
              title: e.title,
              start_at: e.start_at,
              label: formatLabel(e.start_at),
              accent: accents[i % 2],
              image: images[i % 2],
            }))
          );
        }
      })
      .catch(() => {/* keep fallback */});

    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {displayEvents.map((ev) => {
        const left = ready ? getTimeLeft(new Date(ev.start_at)) : null;
        const isGold = ev.accent === 'gold';
        return (
          <div
            key={ev.title}
            className={`overflow-hidden rounded-[24px] ${isGold ? 'border border-gold/40' : 'border border-hope-blue/20'}`}
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img src={ev.image} alt={ev.title} className="h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className={`p-6 ${isGold ? 'bg-[#FFF9EC]' : 'bg-[#EEF4FD]'}`}>
              <h3 className="mb-0.5 font-display text-[17px] font-bold leading-snug text-forest-900">{ev.title}</h3>
              <p className="mb-5 text-sm text-muted">{ev.label}</p>
              <div className="grid grid-cols-4 gap-2">
                {left ? (
                  <>
                    <Tile value={left.days} label="Days" accent={ev.accent} />
                    <Tile value={left.hours} label="Hrs" accent={ev.accent} />
                    <Tile value={left.minutes} label="Mins" accent={ev.accent} />
                    <Tile value={left.seconds} label="Secs" accent={ev.accent} />
                  </>
                ) : (
                  ['Days', 'Hrs', 'Mins', 'Secs'].map((l) => (
                    <Tile key={l} value={0} label={l} accent={ev.accent} />
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
