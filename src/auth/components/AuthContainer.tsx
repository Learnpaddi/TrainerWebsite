import { GraduationCap, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import LoginForm, { type AuthRole, type LoginValues } from '@/auth/components/LoginForm';
import SignupForm, { type SignupValues } from '@/auth/components/SignupForm';

export type AuthTab = 'signin' | 'signup';

interface AuthContainerProps {
  initialRole?: AuthRole;
  initialTab?: AuthTab;
  lockRole?: boolean;
  trainerSignupEnabled?: boolean;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onRoleChange?: (role: AuthRole) => void;
  onTabChange?: (tab: AuthTab) => void;
  onSignIn: (role: AuthRole, values: LoginValues) => Promise<void> | void;
  onSignUp: (role: AuthRole, values: SignupValues) => Promise<void> | void;
}

const tabs: Array<{ key: AuthTab; label: string; icon: typeof LogIn }> = [
  { key: 'signin', label: 'Sign In', icon: LogIn },
  { key: 'signup', label: 'Sign Up', icon: UserPlus },
];

const roleConfig = {
  student: {
    title: 'Student LMS Access',
    subtitle: 'Continue learning, track progress, and access your courses instantly.',
    accent: 'blue' as const,
    shellGlow: 'ring-blue-100/80',
    roleActive: 'bg-white text-blue-700 shadow-[0_12px_30px_rgba(37,99,235,0.18)]',
    roleIdle: 'text-slate-500 hover:bg-white/70 hover:text-slate-700',
    tabActive: 'border-blue-600 text-blue-700',
    inputFocus: 'focus:border-blue-400 focus:ring-4 focus:ring-blue-100/80',
    submitButton: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white shadow-[0_18px_40px_rgba(37,99,235,0.3)] hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(37,99,235,0.36)]',
    spotlight: 'from-blue-500/10 via-sky-400/10 to-cyan-400/10',
  },
  trainer: {
    title: 'Trainer LMS Access',
    subtitle: 'Manage courses, monitor enrollments, and run your learning business.',
    accent: 'emerald' as const,
    shellGlow: 'ring-emerald-100/80',
    roleActive: 'bg-white text-teal-700 shadow-[0_12px_30px_rgba(13,148,136,0.18)]',
    roleIdle: 'text-slate-500 hover:bg-white/70 hover:text-slate-700',
    tabActive: 'border-teal-600 text-teal-700',
    inputFocus: 'focus:border-teal-400 focus:ring-4 focus:ring-teal-100/80',
    submitButton: 'bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-500 text-white shadow-[0_18px_40px_rgba(13,148,136,0.28)] hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(13,148,136,0.34)]',
    spotlight: 'from-emerald-500/10 via-teal-400/10 to-cyan-400/10',
  },
};

const AuthContainer = ({
  initialRole = 'student',
  initialTab = 'signin',
  lockRole = false,
  trainerSignupEnabled = false,
  isSubmitting = false,
  errorMessage,
  onRoleChange,
  onTabChange,
  onSignIn,
  onSignUp,
}: AuthContainerProps) => {
  const [activeRole, setActiveRole] = useState<AuthRole>(initialRole);
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);

  useEffect(() => {
    setActiveRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!trainerSignupEnabled && activeRole === 'trainer' && activeTab === 'signup') {
      setActiveTab('signin');
      onTabChange?.('signin');
    }
  }, [activeRole, activeTab, onTabChange, trainerSignupEnabled]);

  const ui = roleConfig[activeRole];
  const visibleTabs = useMemo(() => {
    if (activeRole === 'trainer' && !trainerSignupEnabled) {
      return [{ key: 'signin' as const, label: 'Login', icon: LogIn }];
    }
    return tabs;
  }, [activeRole, trainerSignupEnabled]);

  return (
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center px-3 py-6 sm:px-5 sm:py-10 lg:px-8 lg:py-12">
      <section className={`relative w-full max-w-[640px] overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.16)] ring-1 backdrop-blur-xl sm:rounded-3xl ${ui.shellGlow}`}>
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${ui.spotlight}`} />

        <div className="relative border-b border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 px-4 py-4 sm:px-6 sm:py-5">
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{ui.title}</h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">{ui.subtitle}</p>

          <div className="mt-5 flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 p-1.5 shadow-inner backdrop-blur">
            <button
              type="button"
              disabled={lockRole}
              onClick={() => {
                setActiveRole('student');
                onRoleChange?.('student');
              }}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition duration-300 ${
                activeRole === 'student'
                  ? ui.roleActive
                  : ui.roleIdle
              } ${lockRole ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <GraduationCap className="h-4 w-4" />
              Student
            </button>
            <button
              type="button"
              disabled={lockRole}
              onClick={() => {
                if (!trainerSignupEnabled && activeTab === 'signup') {
                  setActiveTab('signin');
                  onTabChange?.('signin');
                }
                setActiveRole('trainer');
                onRoleChange?.('trainer');
              }}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition duration-300 ${
                activeRole === 'trainer'
                  ? ui.roleActive
                  : ui.roleIdle
              } ${lockRole ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <ShieldCheck className="h-4 w-4" />
              Trainer
            </button>
          </div>
        </div>

        <div className="relative px-4 pb-5 pt-3 sm:px-6 sm:pb-7 sm:pt-5">
          <div className="mb-5 flex items-center gap-5 border-b border-slate-200">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.key);
                    onTabChange?.(tab.key);
                  }}
                  className={`inline-flex items-center gap-2 border-b-2 px-1 pb-3 pt-1 text-sm font-semibold transition duration-200 ${
                    activeTab === tab.key
                      ? ui.tabActive
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/85 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur sm:p-4">
            <div className="relative min-h-[25rem]">
              <div
                className={`absolute inset-0 px-1 transition-all duration-300 ${
                  activeTab === 'signin'
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-4 opacity-0'
                }`}
                aria-hidden={activeTab !== 'signin'}
              >
                <LoginForm
                  title="Welcome back"
                  subtitle="Sign in to continue to your LMS dashboard."
                  submitLabel={activeRole === 'trainer' ? 'Enter Trainer LMS' : 'Enter Student LMS'}
                  accent={ui.accent}
                  inputClassName={ui.inputFocus}
                  submitButtonClassName={ui.submitButton}
                  isSubmitting={isSubmitting && activeTab === 'signin'}
                  externalError={activeTab === 'signin' ? errorMessage : null}
                  onSubmit={(values) => onSignIn(activeRole, values)}
                />
              </div>

              <div
                className={`px-1 transition-all duration-300 ${
                  activeTab === 'signup'
                    ? 'relative translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-4 opacity-0'
                }`}
                aria-hidden={activeTab !== 'signup'}
              >
                <SignupForm
                  title="Create your account"
                  subtitle="Set up your profile and start your LMS journey."
                  submitLabel={activeRole === 'trainer' ? 'Create Trainer Account' : 'Create Student Account'}
                  accent={ui.accent}
                  inputClassName={ui.inputFocus}
                  submitButtonClassName={ui.submitButton}
                  isSubmitting={isSubmitting && activeTab === 'signup'}
                  externalError={activeTab === 'signup' ? errorMessage : null}
                  onSubmit={(values) => onSignUp(activeRole, values)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthContainer;
