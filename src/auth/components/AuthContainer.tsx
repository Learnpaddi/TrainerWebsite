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
    ring: 'ring-blue-100',
    tabActive: 'text-blue-700 border-blue-600',
    tabIdle: 'text-slate-500 border-transparent hover:text-slate-700',
  },
  trainer: {
    title: 'Trainer LMS Access',
    subtitle: 'Manage courses, monitor enrollments, and run your learning business.',
    accent: 'emerald' as const,
    ring: 'ring-emerald-100',
    tabActive: 'text-emerald-700 border-emerald-600',
    tabIdle: 'text-slate-500 border-transparent hover:text-slate-700',
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

  const activeIndex = tabs.findIndex((tab) => tab.key === activeTab);

  return (
    <div className="flex min-h-[calc(100vh-9rem)] items-center justify-center px-3 py-6 sm:px-5 sm:py-10 lg:px-8 lg:py-12">
      <section className={`w-full max-w-[560px] overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] ring-1 sm:rounded-3xl ${ui.ring}`}>
        <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-4 sm:px-6 sm:py-5">
          <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{ui.title}</h1>
          <p className="mt-1.5 text-sm leading-6 text-slate-600">{ui.subtitle}</p>

          <div className="mt-4 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              disabled={lockRole}
              onClick={() => {
                setActiveRole('student');
                onRoleChange?.('student');
              }}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                activeRole === 'student'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
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
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${
                activeRole === 'trainer'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              } ${lockRole ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <ShieldCheck className="h-4 w-4" />
              Trainer
            </button>
          </div>
        </div>

        <div className="px-4 pb-5 pt-3 sm:px-6 sm:pb-7 sm:pt-5">
          <div className="mb-4 flex items-center gap-5 border-b border-slate-200">
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
                  className={`inline-flex items-center gap-2 border-b-2 px-1 pb-3 pt-1 text-sm font-semibold transition ${
                    activeTab === tab.key ? ui.tabActive : ui.tabIdle
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex w-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              <div className={`w-full shrink-0 px-1 transition-opacity duration-500 ${activeTab === 'signin' ? 'opacity-100' : 'opacity-35'}`}>
                <LoginForm
                  title="Welcome back"
                  subtitle="Sign in to continue to your LMS dashboard."
                  submitLabel={activeRole === 'trainer' ? 'Enter Trainer LMS' : 'Enter Student LMS'}
                  accent={ui.accent}
                  isSubmitting={isSubmitting && activeTab === 'signin'}
                  externalError={activeTab === 'signin' ? errorMessage : null}
                  onSubmit={(values) => onSignIn(activeRole, values)}
                />
              </div>

              <div className={`w-full shrink-0 px-1 transition-opacity duration-500 ${activeTab === 'signup' ? 'opacity-100' : 'opacity-35'}`}>
                <SignupForm
                  title="Create your account"
                  subtitle="Set up your profile and start your LMS journey."
                  submitLabel={activeRole === 'trainer' ? 'Create Trainer Account' : 'Create Student Account'}
                  accent={ui.accent}
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
