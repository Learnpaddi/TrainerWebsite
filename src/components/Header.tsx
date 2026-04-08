import { BarChart3, Bell, BookOpen, LayoutDashboard, LogOut, Mail, MessageSquare, Search, Settings } from 'lucide-react';
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
  const initials = (profileName || (role === 'trainer' ? 'Trainer' : 'Student'))
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const dashboardPath = role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard';
  const navItems = [
    { label: 'Dashboard', to: dashboardPath, icon: LayoutDashboard },
    { label: 'Courses', to: '/courses', icon: BookOpen },
    { label: 'Analytics', to: '/analytics', icon: BarChart3 },
    { label: 'Messages', to: '/messages', icon: MessageSquare },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
      <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {role} dashboard
            </div>
            <h1 className="truncate text-2xl font-semibold text-corporate-text sm:text-3xl">{title}</h1>
            <p className="mt-1 line-clamp-1 text-sm text-corporate-muted">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onAction}
            className="hidden items-center rounded-xl bg-corporate-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:inline-flex"
            
          >
            {actionLabel}
          </button>
        </div>

        <nav className="mt-3 flex flex-wrap items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-50 text-corporate-accent'
                    : 'text-corporate-muted hover:bg-slate-100 hover:text-corporate-text'
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
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-corporate-muted transition hover:bg-red-50 hover:text-corporate-error"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>

        <div className="mt-4 flex flex-wrap items-center gap-2.5 sm:gap-3">
          <label className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search courses, learners, analytics..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-corporate-text outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <button type="button" className="rounded-xl border border-slate-200 bg-white p-2.5 text-corporate-muted transition hover:bg-slate-50">
            <Bell className="h-4.5 w-4.5" />
          </button>
          <button type="button" className="rounded-xl border border-slate-200 bg-white p-2.5 text-corporate-muted transition hover:bg-slate-50">
            <Mail className="h-4.5 w-4.5" />
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-corporate-primary text-xs font-bold text-white">
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-corporate-text">{profileName || 'LearnPaddi User'}</p>
              <p className="text-xs capitalize text-corporate-muted">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
