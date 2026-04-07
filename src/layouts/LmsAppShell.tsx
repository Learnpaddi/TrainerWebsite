import type { ReactNode } from 'react';
import { BarChart3, BookOpen, Compass, FilePlus2, GraduationCap, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Footer from '@/shared/components/Footer';
import Navbar from '@/shared/components/Navbar';
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
    { to: '/trainer/create-course', label: 'Create Course', icon: FilePlus2 },
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
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:flex-row lg:px-6">
        <aside className="lms-panel h-fit w-full p-5 lg:sticky lg:top-28 lg:w-80">
          <div className="rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-primary to-cyan-500 p-6 text-white shadow-xl">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15">
              {role === 'student' ? <GraduationCap className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">{role} workspace</p>
            <h2 className="mt-3 text-2xl font-black">{profile?.name || 'LearnPaddi User'}</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">{profile?.email || 'role@learnpaddi.com'}</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
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

          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Scalable SaaS Foundation</p>
                <p className="text-xs text-slate-500">Marketplace, player, progress, and trainer operations are all wired.</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setRole(null);
              navigate('/auth');
            }}
            className="secondary-cta mt-6 w-full px-5 py-3 text-sm"
          >
            Switch Role
          </button>
        </aside>

        <main className="min-w-0 flex-1 space-y-8">
          <section className="surface-panel px-6 py-8 lg:px-8">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              LearnPaddi LMS
            </p>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-950">{title}</h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{subtitle}</p>
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
