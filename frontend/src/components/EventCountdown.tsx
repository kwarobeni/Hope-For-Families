import { useState, useEffect } from 'react';

const EVENTS = [
  {
    name: 'Hope For Families Summer BBQ Festival',
    date: new Date('2026-08-08T12:00:00'),
    label: 'Saturday, 8 August 2026',
    tag: 'Summer Festival',
    accent: 'gold' as const,
    image: '/images/moment-3.jpg',
    imageAlt: 'Community gathered at our summer festival',
  },
  {
    name: 'Christmas Afroball',
    date: new Date('2026-12-12T19:00:00'),
    label: 'Saturday, 12 December 2026',
    tag: 'Winter Celebration',
    accent: 'blue' as const,
    image: '/images/moment-1.jpg',
    imageAlt: 'Celebration at Hope For Families',
  },
];

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

  useEffect(() => {
    setReady(true);
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {EVENTS.map((ev) => {
        const left = ready ? getTimeLeft(ev.date) : null;
        const isGold = ev.accent === 'gold';
        return (
          <div
            key={ev.name}
            className={`overflow-hidden rounded-[24px] ${isGold ? 'border border-gold/40' : 'border border-hope-blue/20'}`}
          >
            {/* Event highlight image */}
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={ev.image}
                alt={ev.imageAlt}
                className="h-full w-full object-cover object-top"
              />
              {/* Gradient overlay so the tag badge reads cleanly */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className={`absolute bottom-3 left-4 rounded-full px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.12em] ${isGold ? 'bg-gold text-forest-900' : 'bg-hope-blue text-white'}`}>
                {ev.tag}
              </span>
            </div>

            {/* Card body */}
            <div className={`p-6 ${isGold ? 'bg-[#FFF9EC]' : 'bg-[#EEF4FD]'}`}>
              <h3 className="mb-0.5 font-display text-[17px] font-bold leading-snug text-forest-900">{ev.name}</h3>
              <p className="mb-5 text-sm text-muted">{ev.label}</p>

              {left ? (
                <div className="grid grid-cols-4 gap-2">
                  <Tile value={left.days} label="Days" accent={ev.accent} />
                  <Tile value={left.hours} label="Hrs" accent={ev.accent} />
                  <Tile value={left.minutes} label="Mins" accent={ev.accent} />
                  <Tile value={left.seconds} label="Secs" accent={ev.accent} />
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {['Days', 'Hrs', 'Mins', 'Secs'].map((l) => (
                    <Tile key={l} value={0} label={l} accent={ev.accent} />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
