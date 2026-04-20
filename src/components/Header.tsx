import { BarChart3, Bell, BookOpen, ClipboardList, LayoutDashboard, LogOut, Mail, MessageSquare, Search, Settings } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';

interface HeaderProps {
  role: 'student' | 'trainer';
  actionLabel: string;
  onAction: () => void;
  profileName?: string;
}

const Header = ({
  role,
  actionLabel,
  onAction,
  profileName,
}: HeaderProps) => {
  const navigate = useNavigate();
  const { logoutCurrentUser } = useRole();
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
    <header className="px-3 pb-3 sm:px-5 lg:px-6">
      <div className="header-control-panel rounded-[1.5rem] p-3 sm:p-4 lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto pb-1 pr-1 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) => `inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-bold transition sm:px-3.5 sm:text-xs ${
                    isActive
                      ? 'border-blue-200 bg-blue-600 text-white shadow-lg shadow-blue-200/60'
                      : 'border-white/70 bg-white/88 text-corporate-secondary backdrop-blur hover:border-blue-100 hover:bg-white hover:text-corporate-text'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
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
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent px-3 py-2 text-[11px] font-bold text-corporate-muted transition hover:border-red-100 hover:bg-red-50/90 hover:text-corporate-error sm:px-3.5 sm:text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </nav>

          <button
            type="button"
            onClick={onAction}
            className="primary-cta hidden shrink-0 px-4 py-2 text-xs xl:inline-flex"
          >
            {actionLabel}
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 sm:gap-3">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search courses, learners, analytics..."
              className="w-full rounded-full border border-white/80 bg-white/90 py-2.5 pl-10 pr-4 text-sm text-corporate-text shadow-sm outline-none backdrop-blur transition focus:border-blue-200 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <button type="button" className="rounded-full border border-white/75 bg-white/88 p-[0.6rem] text-corporate-muted shadow-sm transition hover:bg-white">
            <Bell className="h-4 w-4" />
          </button>
          <button type="button" className="rounded-full border border-white/75 bg-white/88 p-[0.6rem] text-corporate-muted shadow-sm transition hover:bg-white">
            <Mail className="h-4 w-4" />
          </button>
          <div className="hidden items-center gap-2 rounded-full border border-white/75 bg-white/88 px-2.5 py-1.5 shadow-sm backdrop-blur md:inline-flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-corporate-primary to-primary text-xs font-bold text-white shadow-md">
              {initials}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-corporate-text">{profileName || 'LearnPaddi User'}</p>
              <p className="text-xs capitalize text-corporate-muted">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
