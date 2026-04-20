import { BarChart3, BookOpen, ClipboardList, LayoutDashboard, LogOut, MessageSquare, Settings } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';

interface SidebarProps {
  role: 'student' | 'trainer';
  className?: string;
  onNavigate?: () => void;
}

const Sidebar = ({ role, className, onNavigate }: SidebarProps) => {
  const navigate = useNavigate();
  const { profile, logoutCurrentUser } = useRole();

  const dashboardPath = role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard';
  const coursesPath = role === 'trainer' ? '/trainer/manage-courses' : '/courses';

  const navItems = [
    { label: 'Dashboard', to: dashboardPath, icon: LayoutDashboard },
    { label: 'Courses', to: coursesPath, icon: BookOpen },
    ...(role === 'student' ? [{ label: 'Exams', to: '/student/examinations', icon: ClipboardList }] : []),
    { label: 'Analytics', to: `${dashboardPath}#analytics`, icon: BarChart3 },
    { label: 'Messages', to: '/messages', icon: MessageSquare },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside className={`flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-slate-950 text-slate-200 shadow-panel ${className || ''}`}>
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(18,179,168,0.22),transparent_30%),linear-gradient(180deg,#10233f_0%,#0d1b2a_100%)] px-5 py-5">
        <div className="flex items-center gap-3">
          <img src="/images/Logo.png" alt="LearnPaddi" className="h-10 w-10 rounded-xl bg-white p-1.5 object-contain shadow-sm" />
          <div>
            <p className="font-display text-lg font-bold text-white">LearnPaddi</p>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">LMS Console</p>
          </div>
        </div>

        <div className={`mt-5 rounded-[1.5rem] border border-white/10 p-4 text-white shadow-lg backdrop-blur ${
          role === 'trainer'
            ? 'bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-400'
            : 'bg-gradient-to-br from-sky-500 via-blue-600 to-cyan-500'
        }`}>
          <p className="text-xs uppercase tracking-[0.16em] text-white/70">{role} workspace</p>
          <p className="mt-1 font-display text-lg font-bold leading-tight">{profile?.name || 'LearnPaddi User'}</p>
          <p className="mt-1 text-xs text-white/75">{profile?.email || 'contact@learnpaddi.in'}</p>
        </div>
      </div>

      <nav className="mt-4 space-y-1.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onNavigate}
            >
              {({ isActive }) => (
                <span
                  className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-lg shadow-black/10'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
                    isActive ? 'bg-slate-100 text-slate-900' : 'bg-white/5 text-slate-300'
                  }`}>
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  {item.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-5 px-4">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Workspace Mode</p>
          <p className="mt-2 text-sm font-semibold text-white">
            {role === 'trainer' ? 'Manage learners, courses, and messaging from one place.' : 'Track lessons, exams, and certificates in one flow.'}
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-white/10 p-4">
        <button
          type="button"
          onClick={async () => {
            await logoutCurrentUser();
            onNavigate?.();
            navigate('/select-role?mode=login');
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-300/40 hover:bg-red-500/10 hover:text-red-100"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
