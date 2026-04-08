import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: 'blue' | 'emerald' | 'amber' | 'violet' | 'slate';
}

const toneClassMap = {
  blue: 'bg-blue-100 text-corporate-accent',
  emerald: 'bg-emerald-100 text-corporate-success',
  amber: 'bg-amber-100 text-corporate-warning',
  violet: 'bg-slate-200 text-corporate-secondary',
  slate: 'bg-slate-100 text-corporate-secondary',
} as const;

const StatCard = ({ title, value, hint, icon: Icon, tone = 'blue' }: StatCardProps) => (
  <article className="rounded-xl border border-slate-200 bg-corporate-surface p-5 shadow-sm transition hover:shadow-md">
    <div className={`mb-3 inline-flex rounded-xl p-2.5 ${toneClassMap[tone]}`}>
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-corporate-muted">{title}</p>
    <p className="mt-2 text-2xl font-semibold text-corporate-text">{value}</p>
    {hint && <p className="mt-1 text-xs text-corporate-muted">{hint}</p>}
  </article>
);

export default StatCard;
