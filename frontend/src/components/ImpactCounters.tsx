import { useEffect, useRef, useState } from 'react';
import type { ImpactStat } from '../lib/api';

const ICON_BG = ['bg-mint-tint', 'bg-gold-tint', 'bg-blue-tint', 'bg-mint-tint'];
const ICON_STROKE = ['#2E8B57', '#d99b1e', '#1F5AA6', '#2E8B57'];

function Counter({ value, label, index }: { value: number; label: string; index: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const duration = 1200;
        const start = performance.now();
        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1);
          setCount(Math.floor(progress * value));
          if (progress < 1) requestAnimationFrame(tick);
          else setCount(value);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div
      ref={ref}
      className="card-lift rounded-[22px] border border-border-soft bg-white p-6 text-center shadow-[0_18px_40px_-26px_rgba(20,84,58,0.4)]"
    >
      <div
        className={`mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-full ${ICON_BG[index % ICON_BG.length]}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ICON_STROKE[index % ICON_STROKE.length]} strokeWidth="1.8">
          <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
          <circle cx="9" cy="8" r="3" />
          <path d="M16 15c2.5.4 4 2.3 4 5" />
        </svg>
      </div>
      <div className="font-display text-3xl font-extrabold text-forest-900 md:text-4xl">{count}+</div>
      <div className="mt-1.5 text-[13px] font-medium text-muted">{label}</div>
    </div>
  );
}

export default function ImpactCounters({ stats }: { stats: ImpactStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
      {stats.map((stat, i) => (
        <Counter key={stat.id} value={stat.value} label={stat.label} index={i} />
      ))}
    </div>
  );
}
