import { GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const options = [
  {
    title: 'Continue as Student',
    description: 'Open the student LMS dashboard to explore courses, track progress, and keep learning.',
    icon: GraduationCap,
    badge: 'Student',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Continue as Trainer',
    description: 'Open the trainer workspace to manage courses, monitor enrollments, and review LMS performance.',
    icon: ShieldCheck,
    badge: 'Trainer',
    accent: 'from-emerald-500 to-teal-500',
  },
];

const AuthSelect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login',
  );
  const ctaLabel = useMemo(() => (mode === 'signup' ? 'Continue to Sign Up' : 'Continue to Sign In'), [mode]);

  const handleRoleContinue = (role: 'student' | 'trainer') => {
    navigate(`/${role}/${mode}`);
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 px-6 py-10 shadow-2xl backdrop-blur lg:px-10 lg:py-14">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_24%)]" />
      <div className="relative text-center mb-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-r from-primary to-accent text-white shadow-xl">
          <Sparkles className="h-8 w-8" />
        </div>
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          LMS Access
        </p>
        <h1 className="mb-4 bg-gradient-to-r from-gray-900 via-primary to-accent bg-clip-text text-4xl font-black text-transparent lg:text-5xl">
          Select Your Role
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-600">
          Choose your role, then continue to {mode === 'signup' ? 'account creation' : 'sign in'}.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`rounded-full px-5 py-3 text-sm font-semibold transition ${mode === 'login' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 shadow-sm hover:text-slate-900'}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`rounded-full px-5 py-3 text-sm font-semibold transition ${mode === 'signup' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-600 shadow-sm hover:text-slate-900'}`}
        >
          Sign Up
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          const nextRole = option.badge.toLowerCase() as 'student' | 'trainer';

          return (
            <button
              key={option.title}
              type="button"
              onClick={() => {
                handleRoleContinue(nextRole);
              }}
              className="group rounded-[2rem] border border-slate-200 bg-white p-8 text-left shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl"
            >
              <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r ${option.accent} text-white shadow-lg`}>
                <Icon className="h-8 w-8" />
              </div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">{option.badge}</p>
              <h2 className="mb-4 text-3xl font-black text-gray-900">{option.title}</h2>
              <p className="mb-8 text-base leading-7 text-gray-600">{option.description}</p>
              <span className="primary-cta px-6 py-4 text-base">
                {ctaLabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AuthSelect;
