import { type ReactNode } from 'react';
import { BarChart3, BookOpen, Compass, FilePlus2, GraduationCap, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import Footer from '@/shared/components/Footer';
import { useRole } from '@/hooks/useRole';

interface LmsAppShellProps {
  role: 'student' | 'trainer';
  title: string;
  subtitle: string;
  children: ReactNode;
}

const navigationMap = {
  student: [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/explore', label: 'Marketplace', icon: Compass },
  ],
  trainer: [
    { to: '/trainer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/trainer/add-course', label: 'Create Course', icon: FilePlus2 },
    { to: '/trainer/manage-courses', label: 'Manage Courses', icon: BookOpen },
  ],
} as const;

const LmsAppShell = ({ role, title, subtitle, children }: LmsAppShellProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, setRole } = useRole();
  const navigation = navigationMap[role];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-5 sm:px-4 lg:flex-row lg:px-6">
        <aside className="lms-panel h-fit w-full p-4 lg:sticky lg:top-24 lg:w-72 xl:w-80">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-950 via-primary to-cyan-500 p-4 text-white shadow-xl">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              {role === 'student' ? <GraduationCap className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">{role} workspace</p>
            <h2 className="mt-2 text-xl font-black leading-tight">{profile?.name || 'LearnPaddi User'}</h2>
            <p className="mt-1 text-sm text-white/75">{profile?.email || 'role@learnpaddi.com'}</p>
          </div>

          <nav className="mt-4 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-blue-50 text-primary shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <BarChart3 className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">SaaS Foundation</p>
                <p className="text-xs text-slate-500">Marketplace, player, progress, and trainer operations.</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setRole(null);
              navigate('/select-role?mode=login');
            }}
            className="secondary-cta mt-4 w-full px-4 py-2.5 text-sm"
          >
            Switch Role
          </button>
        </aside>

        <main className="min-w-0 flex-1 space-y-5">
          <section className="surface-panel px-5 py-6 lg:px-6">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              LearnPaddi LMS
            </p>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{subtitle}</p>
              </div>
            </div>
          </section>

          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default LmsAppShell;
