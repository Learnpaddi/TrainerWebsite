import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: 'blue' | 'emerald' | 'amber' | 'violet' | 'slate';
  to?: string;
  onClick?: () => void;
}

const toneClassMap = {
  blue: 'bg-gradient-to-br from-blue-100 to-cyan-100 text-corporate-accent',
  emerald: 'bg-gradient-to-br from-emerald-100 to-teal-100 text-corporate-success',
  amber: 'bg-gradient-to-br from-amber-100 to-orange-100 text-corporate-warning',
  violet: 'bg-gradient-to-br from-indigo-100 to-sky-100 text-corporate-secondary',
  slate: 'bg-gradient-to-br from-slate-100 to-slate-200 text-corporate-secondary',
} as const;

const StatCard = ({ title, value, hint, icon: Icon, tone = 'blue', to, onClick }: StatCardProps) => {
  const content = (
    <>
      <div className={`mb-4 inline-flex rounded-2xl p-3 shadow-sm ${toneClassMap[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-corporate-muted">{title}</p>
      <p className="mt-3 font-display text-3xl font-bold text-corporate-text">{value}</p>
      {hint && <p className="mt-2 text-sm text-corporate-muted">{hint}</p>}
    </>
  );

  const className = `group relative overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white/90 p-5 shadow-panel backdrop-blur transition ${
    to || onClick ? 'block cursor-pointer hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(16,32,51,0.12)] focus:outline-none focus:ring-2 focus:ring-blue-200' : ''
  }`;

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} w-full text-left`}>
        {content}
      </button>
    );
  }

  return <article className={className}>{content}</article>;
};

export default StatCard;
