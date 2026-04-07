import { BookOpen, GraduationCap, LayoutDashboard, Medal } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import MainLayout from '@/shared/layouts/MainLayout';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/courses', label: 'Explore Courses', icon: BookOpen },
  { to: '/my-courses', label: 'My Courses', icon: GraduationCap },
  { to: '/certificates', label: 'Certificates', icon: Medal },
];

export const StudentLayout = () => {
  const location = useLocation();

  return (
    <MainLayout contentContainer={false}>
      <div className="lms-stage">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 lg:py-10">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <aside className="lms-panel p-5 h-fit lg:sticky lg:top-24">
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold px-3 mb-4">LMS Menu</p>
            <nav className="space-y-2">
              {items.map((item) => {
                const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition ${
                      active
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
          <section>
            <Outlet />
          </section>
        </div>
      </div>
      </div>
    </MainLayout>
  );
};
