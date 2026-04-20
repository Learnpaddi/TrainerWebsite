import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import MainLayout from '@/shared/layouts/MainLayout';
import { useLearningAuth } from '@/features/learning/hooks/useLearningAuth';

export function FeatureShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { user, logout } = useLearningAuth();

  return (
    <MainLayout contentContainer={false}>
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-panel">
          <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(15,110,251,0.14),transparent_24%),linear-gradient(135deg,#f8fbff,#eef5ff)] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">LearnPaddi Learning Hub</p>
                <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">{title}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{subtitle}</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-5 py-4 text-sm shadow-sm backdrop-blur">
                <p className="font-semibold text-slate-900">{user?.name || 'Guest learner'}</p>
                <p className="mt-1 text-slate-500">{user?.email || 'Sign in to continue'}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <NavLink
                to="/learn/dashboard"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-slate-950 text-white' : 'bg-white text-slate-700'}`
                }
              >
                Dashboard
              </NavLink>
              <Link to="/learn/dashboard" className="secondary-cta px-4 py-2 text-sm">
                Browse Courses
              </Link>
              {user ? (
                <button type="button" onClick={logout} className="secondary-cta px-4 py-2 text-sm">
                  Logout
                </button>
              ) : (
                <Link to="/learn/auth" className="primary-cta px-4 py-2 text-sm">
                  Login
                </Link>
              )}
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-8 sm:px-8">{children}</div>
        </div>
      </section>
    </MainLayout>
  );
}
