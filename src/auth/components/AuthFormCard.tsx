import { ArrowLeft, ArrowRight, GraduationCap, ShieldCheck } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

type AuthMode = 'login' | 'signup';
type AuthRole = 'student' | 'trainer';

interface AuthFormCardProps {
  role: AuthRole;
  mode: AuthMode;
  title: string;
  description: string;
  submitLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  onToggleMode: () => void;
  children?: ReactNode;
}

const roleConfig = {
  student: {
    icon: GraduationCap,
    badge: 'Student Access',
    badgeClass: 'from-blue-500 to-cyan-500',
    panelGlow: 'from-blue-100/80 via-cyan-50 to-white',
    borderClass: 'border-blue-100',
    toggleAccent: 'text-blue-600 hover:text-blue-700',
    buttonClass: 'from-blue-600 via-blue-500 to-cyan-400 hover:shadow-blue-200/70',
  },
  trainer: {
    icon: ShieldCheck,
    badge: 'Trainer Access',
    badgeClass: 'from-emerald-500 to-teal-500',
    panelGlow: 'from-emerald-100/80 via-teal-50 to-white',
    borderClass: 'border-emerald-100',
    toggleAccent: 'text-emerald-600 hover:text-emerald-700',
    buttonClass: 'from-emerald-600 via-teal-500 to-cyan-500 hover:shadow-emerald-200/70',
  },
} as const;

const AuthFormCard = ({
  role,
  mode,
  title,
  description,
  submitLabel,
  onSubmit,
  onBack,
  onToggleMode,
  children,
}: AuthFormCardProps) => {
  const config = roleConfig[role];
  const Icon = config.icon;
  const toggleLabel = mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login';

  return (
    <div className={`relative overflow-hidden rounded-[2rem] border ${config.borderClass} bg-gradient-to-br ${config.panelGlow} p-6 shadow-[0_30px_80px_rgba(15,23,42,0.14)] sm:p-8 lg:p-10`}>
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_70%)]" />

      <button
        type="button"
        onClick={onBack}
        className="relative mb-8 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="relative mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={`mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${config.badgeClass} px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-lg`}>
            <Icon className="h-4 w-4" />
            {config.badge}
          </p>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">{description}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="relative space-y-5">
        {children}
        <button
          type="submit"
          className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r ${config.buttonClass} px-6 py-4 text-base font-semibold text-white shadow-xl transition duration-300 hover:-translate-y-0.5`}
        >
          {submitLabel}
          <ArrowRight className="h-5 w-5" />
        </button>
      </form>

      <button
        type="button"
        onClick={onToggleMode}
        className={`relative mt-6 text-sm font-semibold transition ${config.toggleAccent}`}
      >
        {toggleLabel}
      </button>
    </div>
  );
};

export default AuthFormCard;
