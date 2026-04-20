import { type ReactNode } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  Compass,
  FilePlus2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
    { to: '/courses', label: 'Marketplace', icon: Compass },
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
  const { profile, logoutCurrentUser } = useRole();
  const navigation = navigationMap[role];
  const roleLabel = role === 'student' ? 'Student Workspace' : 'Trainer Workspace';
  const initials = (profile?.name || (role === 'student' ? 'Student User' : 'Trainer User'))
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const dashboardPath = role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard';

  const topNavItems = [
    { label: 'Dashboard', to: dashboardPath, icon: LayoutDashboard },
    { label: 'Courses', to: '/courses', icon: BookOpen },
    { label: 'Analytics', to: '/analytics', icon: BarChart3 },
    { label: 'Messages', to: '/messages', icon: MessageSquare },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <header className="border-b border-slate-200 bg-[#f2f3f5]">
        <div className="w-full px-4 py-5 sm:px-6 lg:px-12 lg:py-7">
          <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-slate-500">{role} dashboard</p>
          <h1 className="mt-2 text-5xl font-black leading-[1.08] text-slate-900 sm:text-[4.1rem]">{title}</h1>
          <p className="mt-2 max-w-5xl text-base leading-7 text-slate-700 sm:text-[1.12rem]">{subtitle}</p>

          <nav className="mt-5 flex flex-wrap items-center gap-2.5">
            {topNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) => `inline-flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold transition sm:text-[1.12rem] ${
                    isActive
                      ? 'bg-slate-200 text-slate-900'
                      : 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-6 w-6 sm:h-5 sm:w-5" />
                  {item.label}
                </NavLink>
              );
            })}
            <button
              type="button"
              onClick={async () => {
                await logoutCurrentUser();
                navigate('/select-role?mode=login');
              }}
              className="inline-flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200/80 hover:text-slate-900 sm:text-[1.12rem]"
            >
              <LogOut className="h-6 w-6 sm:h-5 sm:w-5" />
              Logout
            </button>
          </nav>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-7 w-7 -translate-y-1/2 text-slate-400 sm:h-5 sm:w-5" />
              <input
                type="search"
                placeholder="Search courses, learners, analytics..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-14 pr-4 text-[1.1rem] text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 sm:py-4 sm:text-[1.04rem]"
              />
            </label>
            <button type="button" className="rounded-2xl border border-slate-300 bg-white p-3 text-slate-700 transition hover:bg-slate-50 sm:p-3.5">
              <Bell className="h-7 w-7 sm:h-8 sm:w-8" />
            </button>
            <button type="button" className="rounded-2xl border border-slate-300 bg-white p-3 text-slate-700 transition hover:bg-slate-50 sm:p-3.5">
              <Mail className="h-7 w-7 sm:h-8 sm:w-8" />
            </button>
            <div className="inline-flex min-h-[56px] min-w-[56px] items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-base font-black text-slate-700 sm:min-h-[64px] sm:min-w-[64px]">
              {initials}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur lg:sticky lg:top-24">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700 p-5 text-white">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                  {role === 'student' ? <GraduationCap className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-sm font-extrabold">
                  {initials}
                </div>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">{roleLabel}</p>
              <h2 className="mt-2 text-xl font-black leading-tight">{profile?.name || 'LearnPaddi User'}</h2>
              <p className="mt-1 text-sm text-white/80">{profile?.email || 'contact@learnpaddi.in'}</p>
            </div>

            <nav className="mt-5 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.to;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`group flex items-center justify-between rounded-2xl border px-3.5 py-3 text-sm font-semibold transition ${
                      active
                        ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      {item.label}
                    </span>
                    {active && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-900">
                <BarChart3 className="h-4.5 w-4.5 text-emerald-600" />
                <p className="text-sm font-semibold">Workspace Snapshot</p>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                Access marketplace, learning player, progress tracking, and operations in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                await logoutCurrentUser();
                navigate('/select-role?mode=login');
              }}
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Switch Role
            </button>
          </aside>

          <main className="min-w-0 space-y-6">
            <section>{children}</section>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LmsAppShell;
