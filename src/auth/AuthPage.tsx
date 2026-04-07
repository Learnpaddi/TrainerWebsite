import { BookOpenCheck, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StudentLogin from '@/auth/components/StudentLogin';
import StudentSignup from '@/auth/components/StudentSignup';
import TrainerLogin from '@/auth/components/TrainerLogin';
import TrainerSignup from '@/auth/components/TrainerSignup';

type AuthMode = 'login' | 'signup';
type AuthRole = 'student' | 'trainer' | null;

const roleOptions = [
  {
    role: 'student' as const,
    title: 'Continue as Student',
    description: 'Choose the learner flow to access your course library, progress, and certificates.',
    icon: GraduationCap,
    accent: 'from-blue-600 via-blue-500 to-cyan-400',
    ring: 'group-hover:ring-blue-100',
  },
  {
    role: 'trainer' as const,
    title: 'Continue as Trainer',
    description: 'Choose the trainer flow to manage content, review insights, and publish new lessons.',
    icon: ShieldCheck,
    accent: 'from-emerald-600 via-teal-500 to-cyan-500',
    ring: 'group-hover:ring-emerald-100',
  },
];

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode: AuthMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [role, setRole] = useState<AuthRole>(null);
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    setMode(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  }, [searchParams]);

  const selectionTransform = useMemo(() => {
    if (role === 'student') return '-translate-x-full opacity-0';
    if (role === 'trainer') return 'translate-x-full opacity-0';
    return 'translate-x-0 opacity-100';
  }, [role]);

  const studentTransform = role === 'student' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0';
  const trainerTransform = role === 'trainer' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0';

  const handleRoleSelect = (nextRole: Exclude<AuthRole, null>) => {
    setRole(nextRole);
  };

  const handleBack = () => {
    setRole(null);
  };

  const handleToggleMode = () => {
    setMode((current) => (current === 'login' ? 'signup' : 'login'));
  };

  const handleStudentSubmit = () => {
    navigate('/lms/student');
  };

  const handleTrainerSubmit = () => {
    navigate('/lms/trainer');
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(239,246,255,0.92))] shadow-[0_35px_90px_rgba(15,23,42,0.14)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_20%)]" />

      <div className="relative grid min-h-[720px] overflow-hidden lg:min-h-[760px]">
        <div
          className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${selectionTransform}`}
          aria-hidden={role !== null}
        >
          <div className="flex h-full items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
            <div className="w-full max-w-6xl">
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/90 px-5 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  LearnPaddi Auth
                </p>
                <h1 className="bg-gradient-to-r from-slate-950 via-primary to-accent bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl lg:text-6xl">
                  Choose your workspace before you continue
                </h1>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                  Start with the right role, then slide into the {mode === 'login' ? 'sign in' : 'sign up'} flow without leaving the page.
                </p>
              </div>

              <div className="mt-12 grid gap-6 lg:grid-cols-2">
                {roleOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <button
                      key={option.role}
                      type="button"
                      onClick={() => handleRoleSelect(option.role)}
                      className={`group rounded-[2rem] border border-white/80 bg-white/90 p-8 text-left shadow-[0_20px_50px_rgba(15,23,42,0.09)] ring-1 ring-transparent transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_25px_60px_rgba(15,23,42,0.14)] ${option.ring}`}
                    >
                      <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r ${option.accent} text-white shadow-lg`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <h2 className="text-3xl font-black tracking-tight text-slate-900">{option.title}</h2>
                      <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">{option.description}</p>
                      <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                        {mode === 'login' ? 'Open sign in' : 'Open sign up'}
                        <BookOpenCheck className="h-4 w-4 text-primary" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
            </div>
          </div>
        </div>

        <div
          className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${studentTransform}`}
          aria-hidden={role !== 'student'}
        >
          <div className="flex h-full items-center justify-center px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
            <div className="w-full max-w-3xl">
              {mode === 'login' ? (
                <StudentLogin onBack={handleBack} onToggleMode={handleToggleMode} onSubmit={handleStudentSubmit} />
              ) : (
                <StudentSignup onBack={handleBack} onToggleMode={handleToggleMode} onSubmit={handleStudentSubmit} />
              )}
            </div>
          </div>
        </div>

        <div
          className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${trainerTransform}`}
          aria-hidden={role !== 'trainer'}
        >
          <div className="flex h-full items-center justify-center px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
            <div className="w-full max-w-3xl">
              {mode === 'login' ? (
                <TrainerLogin onBack={handleBack} onToggleMode={handleToggleMode} onSubmit={handleTrainerSubmit} />
              ) : (
                <TrainerSignup onBack={handleBack} onToggleMode={handleToggleMode} onSubmit={handleTrainerSubmit} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthPage;
