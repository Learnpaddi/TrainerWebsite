import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AuthContainer, { type AuthTab } from '@/auth/components/AuthContainer';
import type { AuthRole, LoginValues } from '@/auth/components/LoginForm';
import type { SignupValues } from '@/auth/components/SignupForm';
import { getAuthErrorMessage, login, logout, register } from '@/services/firebase/authService';
import { getUserDoc } from '@/services/firebase/userService';
import { useAuth } from '@/hooks/useAuth';
import { consumePendingCourseIntent } from '@/student/lib/courseIntent';

type AuthMode = 'login' | 'signup';
interface AuthPageProps {
  fixedRole?: AuthRole;
  fixedMode?: AuthMode;
}

const getDashboardPath = (role: AuthRole) =>
  role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard';

const normalizeRequestedPath = (fromPath: string | null): string | null => {
  if (!fromPath || !fromPath.startsWith('/')) {
    return null;
  }

  const blockedPrefixes = [
    '/select-role',
    '/student/login',
    '/student/signup',
    '/trainer/login',
    '/trainer/signup',
    '/auth',
    '/login',
    '/register',
  ];

  if (blockedPrefixes.some((prefix) => fromPath.startsWith(prefix))) {
    return null;
  }

  return fromPath;
};

const resolvePostAuthPath = (
  role: AuthRole,
  requestedPath: string | null,
  pendingCourseId: string | null,
) => {
  const dashboardPath = getDashboardPath(role);

  if (role === 'student' && pendingCourseId) {
    return `/course/${pendingCourseId}`;
  }

  if (!requestedPath) {
    return dashboardPath;
  }

  if (role === 'student' && requestedPath.startsWith('/trainer')) {
    return dashboardPath;
  }

  if (role === 'trainer' && (requestedPath.startsWith('/student') || requestedPath.startsWith('/course/'))) {
    return dashboardPath;
  }

  return requestedPath;
};

const modeToTab = (mode: AuthMode): AuthTab => (mode === 'signup' ? 'signup' : 'signin');

const AuthPage = ({ fixedRole, fixedMode }: AuthPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const requestedPath = normalizeRequestedPath(
    searchParams.get('from')
      || (location.state as { from?: string } | null)?.from
      || null,
  );
  const fromQuery = requestedPath ? `?from=${encodeURIComponent(requestedPath)}` : '';

  const initialRole: AuthRole = fixedRole || (searchParams.get('role') === 'trainer' ? 'trainer' : 'student');
  const requestedMode: AuthMode = fixedMode || (searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const initialMode: AuthMode = initialRole === 'trainer' && requestedMode === 'signup' ? 'login' : requestedMode;

  const [role, setRole] = useState<AuthRole>(initialRole);
  const [activeTab, setActiveTab] = useState<AuthTab>(modeToTab(initialMode));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRedirectRole, setPendingRedirectRole] = useState<AuthRole | null>(null);

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  useEffect(() => {
    setActiveTab(modeToTab(initialMode));
  }, [initialMode]);

  useEffect(() => {
    if (!pendingRedirectRole) return;

    if (!authLoading && user?.role === pendingRedirectRole) {
      const pendingCourseId = consumePendingCourseIntent();
      const nextPath = resolvePostAuthPath(user.role, requestedPath, pendingCourseId);
      navigate(nextPath, { replace: true });
      setPendingRedirectRole(null);
    }
  }, [authLoading, navigate, pendingRedirectRole, requestedPath, user?.role]);

  const lockRole = false;
  const trainerSignupEnabled = false;

  const syncRoute = (nextRole: AuthRole, nextTab: AuthTab) => {
    if (fixedRole && fixedMode) return;

    const normalizedTab = nextRole === 'trainer' ? 'signin' : nextTab;
    const nextMode: AuthMode = normalizedTab === 'signup' ? 'signup' : 'login';
    navigate(`/${nextRole}/${nextMode}${fromQuery}`, { replace: true });
  };

  const runLogin = async (targetRole: AuthRole, values: LoginValues) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const credential = await login(values.email, values.password);
      const userDoc = await getUserDoc(credential.user.uid);

      if (!userDoc) {
        await logout();
        setErrorMessage('User profile not found in Firestore. Please sign up first.');
        return;
      }

      if (userDoc.role !== targetRole) {
        await logout();
        setErrorMessage(`This account belongs to ${userDoc.role}. Please choose the correct role.`);
        return;
      }

      setPendingRedirectRole(userDoc.role);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, `Unable to continue with ${targetRole} login.`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const runSignup = async (targetRole: AuthRole, values: SignupValues) => {
    if (targetRole === 'trainer' && !trainerSignupEnabled) {
      setErrorMessage('Trainer signup is currently disabled. Please use trainer login.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await register({
        email: values.email,
        password: values.password,
        name: values.name,
        role: targetRole,
      });

      setPendingRedirectRole(targetRole);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, `Unable to continue with ${targetRole} signup.`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const heading = useMemo(
    () => (role === 'trainer' ? 'Trainer Authentication' : 'Student Authentication'),
    [role],
  );

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-sky-50 to-cyan-50 shadow-[0_35px_90px_rgba(15,23,42,0.14)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.16),transparent_24%)]" />
      <div className="pointer-events-none absolute -left-16 top-12 h-44 w-44 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 right-10 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="relative px-4 pb-8 pt-6 sm:px-8 sm:pb-10 sm:pt-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" />
            LearnPaddi LMS
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{heading}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            A polished LMS entry point with faster role switching, clearer actions, and richer visual feedback.
          </p>
        </div>

        <AuthContainer
          initialRole={role}
          initialTab={activeTab}
          lockRole={lockRole}
          trainerSignupEnabled={trainerSignupEnabled}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onRoleChange={(nextRole) => {
            setErrorMessage(null);
            setRole(nextRole);
            syncRoute(nextRole, activeTab);
          }}
          onTabChange={(nextTab) => {
            setErrorMessage(null);
            setActiveTab(nextTab);
            syncRoute(role, nextTab);
          }}
          onSignIn={runLogin}
          onSignUp={runSignup}
        />
      </div>
    </section>
  );
};

export default AuthPage;
