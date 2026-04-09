import { BarChart3, BookOpen, LayoutDashboard, LogOut, MessageSquare, Settings } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';

interface SidebarProps {
  role: 'student' | 'trainer';
  className?: string;
  onNavigate?: () => void;
}

const Sidebar = ({ role, className, onNavigate }: SidebarProps) => {
  const navigate = useNavigate();
  const { profile, setRole } = useRole();

  const dashboardPath = role === 'trainer' ? '/trainer/dashboard' : '/student/dashboard';
  const coursesPath = role === 'trainer' ? '/trainer/manage-courses' : '/courses';

  const navItems = [
    { label: 'Dashboard', to: dashboardPath, icon: LayoutDashboard },
    { label: 'Courses', to: coursesPath, icon: BookOpen },
    { label: 'Analytics', to: `${dashboardPath}#analytics`, icon: BarChart3 },
    { label: 'Messages', to: '/profile', icon: MessageSquare },
    { label: 'Settings', to: '/profile', icon: Settings },
  ];

  return (
    <aside className={`flex h-full w-full flex-col bg-slate-950 text-slate-200 ${className || ''}`}>
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <img src="/images/Logo.png" alt="LearnPaddi" className="h-10 w-10 rounded-xl bg-white p-1.5 object-contain shadow-sm" />
          <div>
            <p className="text-lg font-black text-white">LearnPaddi</p>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">LMS Console</p>
          </div>
        </div>

        <div className={`mt-5 rounded-2xl p-4 text-white shadow-lg ${
          role === 'trainer'
            ? 'bg-gradient-to-br from-primary via-cyan-500 to-emerald-400'
            : 'bg-gradient-to-br from-indigo-500 via-primary to-cyan-500'
        }`}>
          <p className="text-xs uppercase tracking-[0.16em] text-white/70">{role} workspace</p>
          <p className="mt-1 text-lg font-bold leading-tight">{profile?.name || 'LearnPaddi User'}</p>
          <p className="mt-1 text-xs text-white/75">{profile?.email || 'contact@learnpaddi.in'}</p>
        </div>
      </div>

      <nav className="mt-4 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 p-4">
        <button
          type="button"
          onClick={() => {
            setRole(null);
            onNavigate?.();
            navigate('/select-role?mode=login');
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-red-300/40 hover:bg-red-500/10 hover:text-red-100"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
