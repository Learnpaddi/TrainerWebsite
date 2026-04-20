import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainLayout from '@/shared/layouts/MainLayout';
import { useLearningAuth } from '@/features/learning/hooks/useLearningAuth';

type AuthMode = 'login' | 'register';

const initialRegister = {
  name: '',
  email: '',
  password: '',
};

const initialLogin = {
  email: '',
  password: '',
};

export default function LearningAuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useLearningAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const from = (location.state as { from?: string } | null)?.from || '/learn/dashboard';

  const handleLogin = async () => {
    setSubmitting(true);
    setError('');

    try {
      await login(loginForm.email, loginForm.password);
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to login right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    setSubmitting(true);
    setError('');

    try {
      await register(registerForm);
      navigate('/learn/dashboard', { replace: true });
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'Unable to create your account right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout contentContainer={false}>
      <div className="mx-auto grid min-h-[calc(100vh-10rem)] w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(15,110,251,0.16),transparent_24%),linear-gradient(135deg,#ffffff,#eef6ff)] p-8 shadow-panel lg:p-10">
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            learnpaddi.in
          </p>
          <h1 className="mt-6 text-4xl font-black text-slate-950 sm:text-5xl">Modern course enrollment, payment, and exam flow.</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            Sign in to test the full journey: enroll in a course, complete it, unlock payment when required, and attempt a timed MCQ exam with score calculation.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/80 bg-white/80 p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-900">Free course behavior</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">Complete the course and the exam unlocks immediately.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/80 bg-white/80 p-5 shadow-sm">
              <p className="text-sm font-bold text-slate-900">Paid course behavior</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">Completion alone is not enough. Successful payment is required before exam start.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-panel lg:p-10">
          <div className="flex gap-3 rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${mode === 'login' ? 'bg-slate-950 text-white' : 'text-slate-600'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${mode === 'register' ? 'bg-slate-950 text-white' : 'text-slate-600'}`}
            >
              Register
            </button>
          </div>

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {mode === 'login' ? (
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400"
                  placeholder="learner@learnpaddi.in"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400"
                  placeholder="Enter your password"
                />
              </label>
              <button type="button" onClick={handleLogin} disabled={submitting} className="primary-cta w-full px-5 py-3 text-sm disabled:opacity-70">
                {submitting ? 'Logging in...' : 'Login to Learning Hub'}
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Full name</span>
                <input
                  value={registerForm.name}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400"
                  placeholder="Aarav Kumar"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400"
                  placeholder="learner@learnpaddi.in"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400"
                  placeholder="Create a secure password"
                />
              </label>
              <button type="button" onClick={handleRegister} disabled={submitting} className="primary-cta w-full px-5 py-3 text-sm disabled:opacity-70">
                {submitting ? 'Creating account...' : 'Create learner account'}
              </button>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
