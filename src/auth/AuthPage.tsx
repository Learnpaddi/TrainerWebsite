import { BookOpenCheck, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import StudentLogin from '@/auth/components/StudentLogin';
import StudentSignup from '@/auth/components/StudentSignup';
import TrainerLogin from '@/auth/components/TrainerLogin';
import TrainerSignup from '@/auth/components/TrainerSignup';
import { getAuthErrorMessage, login, logout, register } from '@/services/firebase/authService';
import { getUserDoc } from '@/services/firebase/userService';
import { useAuth } from '@/hooks/useAuth';

type AuthMode = 'login' | 'signup';
type AuthRole = 'student' | 'trainer' | null;
type AuthFlowPhase = 'creating' | 'signing' | 'loading' | 'opening';
interface AuthPageProps {
  fixedRole?: Exclude<AuthRole, null>;
  fixedMode?: AuthMode;
}

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

const AuthPage = ({ fixedRole, fixedMode }: AuthPageProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const initialMode: AuthMode = fixedMode || (searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [role, setRole] = useState<AuthRole>(fixedRole || null);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRedirectRole, setPendingRedirectRole] = useState<Exclude<AuthRole, null> | null>(null);
  const [authFlow, setAuthFlow] = useState<{ visible: boolean; phase: AuthFlowPhase; role: Exclude<AuthRole, null> }>({
    visible: false,
    phase: 'loading',
    role: 'student',
  });

  useEffect(() => {
    if (!pendingRedirectRole) {
      return;
    }

    if (!authLoading && user?.role === pendingRedirectRole) {
      navigate(user.role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard', { replace: true });
      setPendingRedirectRole(null);
      setAuthFlow((current) => ({ ...current, visible: false }));
    } else if (authLoading) {
      setAuthFlow((current) => ({ ...current, visible: true, phase: 'loading' }));
    }
  }, [authLoading, navigate, pendingRedirectRole, user?.role]);

  useEffect(() => {
    if (fixedMode) {
      setMode(fixedMode);
      return;
    }
    setMode(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  }, [fixedMode, searchParams]);

  useEffect(() => {
    if (fixedRole) {
      setRole(fixedRole);
    }
  }, [fixedRole]);

  useEffect(() => {
    if (!fixedRole || pendingRedirectRole) {
      return;
    }
    if (!authLoading && user?.role) {
      navigate(user.role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard', { replace: true });
    }
  }, [authLoading, fixedRole, navigate, pendingRedirectRole, user?.role]);

  const selectionTransform = useMemo(() => {
    if (role === 'student') return '-translate-x-full opacity-0';
    if (role === 'trainer') return 'translate-x-full opacity-0';
    return 'translate-x-0 opacity-100';
  }, [role]);

  const studentTransform = role === 'student' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0';
  const trainerTransform = role === 'trainer' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0';

  const handleRoleSelect = (nextRole: Exclude<AuthRole, null>) => {
    setErrorMessage(null);
    setRole(nextRole);
    navigate(`/${nextRole}/${mode}`);
  };

  const handleBack = () => {
    setErrorMessage(null);
    setPendingRedirectRole(null);
    setAuthFlow((current) => ({ ...current, visible: false }));
    if (fixedRole) {
      navigate(`/select-role?mode=${mode}`);
      return;
    }
    setRole(null);
  };

  const handleToggleMode = () => {
    setErrorMessage(null);
    const nextMode: AuthMode = mode === 'login' ? 'signup' : 'login';
    if (fixedRole) {
      navigate(`/${fixedRole}/${nextMode}`);
      return;
    }
    setMode(nextMode);
  };

  const handleStudentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const name = String(formData.get('name') || '').trim();

    setIsSubmitting(true);
    setErrorMessage(null);
    setAuthFlow({ visible: true, phase: mode === 'signup' ? 'creating' : 'signing', role: 'student' });

    try {
      if (mode === 'signup') {
        await register({ email, password, name, role: 'student' });
        setAuthFlow({ visible: true, phase: 'opening', role: 'student' });
        setPendingRedirectRole('student');
        return;
      }

      const credential = await login(email, password);
      const userDoc = await getUserDoc(credential.user.uid);
      if (!userDoc) {
        await logout();
        setErrorMessage('User profile not found in Firestore. Please sign up first.');
        setAuthFlow((current) => ({ ...current, visible: false }));
        return;
      }

      setAuthFlow({ visible: true, phase: 'opening', role: userDoc.role });
      setPendingRedirectRole(userDoc.role);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, 'Unable to continue with student authentication.'));
      setAuthFlow((current) => ({ ...current, visible: false }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrainerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const name = String(formData.get('name') || '').trim();

    setIsSubmitting(true);
    setErrorMessage(null);
    setAuthFlow({ visible: true, phase: mode === 'signup' ? 'creating' : 'signing', role: 'trainer' });

    try {
      if (mode === 'signup') {
        await register({ email, password, name, role: 'trainer' });
        setAuthFlow({ visible: true, phase: 'opening', role: 'trainer' });
        setPendingRedirectRole('trainer');
        return;
      }

      const credential = await login(email, password);
      const userDoc = await getUserDoc(credential.user.uid);
      if (!userDoc) {
        await logout();
        setErrorMessage('User profile not found in Firestore. Please sign up first.');
        setAuthFlow((current) => ({ ...current, visible: false }));
        return;
      }

      setAuthFlow({ visible: true, phase: 'opening', role: userDoc.role });
      setPendingRedirectRole(userDoc.role);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, 'Unable to continue with trainer authentication.'));
      setAuthFlow((current) => ({ ...current, visible: false }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const flowText = (() => {
    if (authFlow.phase === 'creating') {
      return authFlow.role === 'trainer' ? 'Creating trainer account...' : 'Creating student account...';
    }
    if (authFlow.phase === 'signing') {
      return authFlow.role === 'trainer' ? 'Signing you in as trainer...' : 'Signing you in as student...';
    }
    if (authFlow.phase === 'opening') {
      return authFlow.role === 'trainer' ? 'Opening trainer workspace...' : 'Opening student workspace...';
    }
    return 'Loading your workspace...';
  })();

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
                <StudentLogin
                  onBack={handleBack}
                  onToggleMode={handleToggleMode}
                  onSubmit={handleStudentSubmit}
                  errorMessage={errorMessage}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <StudentSignup
                  onBack={handleBack}
                  onToggleMode={handleToggleMode}
                  onSubmit={handleStudentSubmit}
                  errorMessage={errorMessage}
                  isSubmitting={isSubmitting}
                />
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
                <TrainerLogin
                  onBack={handleBack}
                  onToggleMode={handleToggleMode}
                  onSubmit={handleTrainerSubmit}
                  errorMessage={errorMessage}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <TrainerSignup
                  onBack={handleBack}
                  onToggleMode={handleToggleMode}
                  onSubmit={handleTrainerSubmit}
                  errorMessage={errorMessage}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {authFlow.visible ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm">
          <div className="w-[min(92vw,460px)] rounded-3xl border border-white/40 bg-white/95 p-8 shadow-[0_35px_90px_rgba(15,23,42,0.35)]">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center">
              <span className="absolute h-20 w-20 animate-ping rounded-full bg-cyan-300/50" />
              <span className="absolute h-16 w-16 animate-pulse rounded-full bg-blue-200/70" />
              <span className="relative h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
            </div>
            <p className="text-center text-lg font-black tracking-tight text-slate-900">{flowText}</p>
            <p className="mt-2 text-center text-sm text-slate-600">
              Please wait while we prepare your secure {authFlow.role} session.
            </p>
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-1/2 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500" />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default AuthPage;
