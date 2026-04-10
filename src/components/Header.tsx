import { BarChart3, Bell, BookOpen, ClipboardList, LayoutDashboard, LogOut, Mail, MessageSquare, Search, Settings } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';

interface HeaderProps {
  role: 'student' | 'trainer';
  title: string;
  subtitle: string;
  actionLabel: string;
  onAction: () => void;
  profileName?: string;
}

const Header = ({
  role,
  title,
  subtitle,
  actionLabel,
  onAction,
  profileName,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { setRole } = useRole();
  const workspaceLabel = role === 'trainer' ? 'Trainer command center' : 'Student learning hub';
  const initials = (profileName || (role === 'trainer' ? 'Trainer' : 'Student'))
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const dashboardPath = role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard';
  const coursesPath = role === 'trainer' ? '/trainer/manage-courses' : '/courses';
  const navItems = [
    { label: 'Dashboard', to: dashboardPath, icon: LayoutDashboard },
    { label: 'Courses', to: coursesPath, icon: BookOpen },
    ...(role === 'student' ? [{ label: 'Exams', to: '/student/examinations', icon: ClipboardList }] : []),
    { label: 'Analytics', to: '/analytics', icon: BarChart3 },
    { label: 'Messages', to: '/messages', icon: MessageSquare },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <header className="glass-header sticky top-0 z-30">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="lms-hero-shell rounded-[1.75rem] px-5 py-5 sm:px-6 lg:px-8">
          <div className="lms-grid-bg absolute inset-0 opacity-40" />
          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-blue-700 shadow-sm">
                  {workspaceLabel}
                </div>
                <h1 className="truncate font-display text-3xl font-bold text-corporate-text sm:text-4xl">{title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-corporate-muted sm:text-[0.98rem]">{subtitle}</p>
              </div>

              <button
                type="button"
                onClick={onAction}
                className="primary-cta hidden px-5 py-3 text-sm sm:inline-flex"
              >
                {actionLabel}
              </button>
            </div>

            <nav className="mt-5 flex flex-wrap items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={({ isActive }) => `inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                      isActive
                        ? 'border-blue-200 bg-blue-600 text-white shadow-lg shadow-blue-200/60'
                        : 'border-white/70 bg-white/70 text-corporate-secondary backdrop-blur hover:border-blue-100 hover:bg-white hover:text-corporate-text'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setRole(null);
                  navigate('/select-role?mode=login');
                }}
                className="inline-flex items-center gap-2 rounded-full border border-transparent px-3.5 py-2 text-xs font-bold text-corporate-muted transition hover:border-red-100 hover:bg-red-50/90 hover:text-corporate-error"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>

            <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <label className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search courses, learners, analytics..."
                  className="w-full rounded-full border border-white/80 bg-white/85 py-3 pl-11 pr-4 text-sm text-corporate-text shadow-sm outline-none backdrop-blur transition focus:border-blue-200 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <button type="button" className="rounded-full border border-white/75 bg-white/80 p-3 text-corporate-muted shadow-sm transition hover:bg-white">
                <Bell className="h-4.5 w-4.5" />
              </button>
              <button type="button" className="rounded-full border border-white/75 bg-white/80 p-3 text-corporate-muted shadow-sm transition hover:bg-white">
                <Mail className="h-4.5 w-4.5" />
              </button>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/82 px-2.5 py-1.5 shadow-sm backdrop-blur">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-corporate-primary to-primary text-xs font-bold text-white shadow-md">
                  {initials}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-bold text-corporate-text">{profileName || 'LearnPaddi User'}</p>
                  <p className="text-xs capitalize text-corporate-muted">{role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
