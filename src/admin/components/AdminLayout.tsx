import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, LogOut } from 'lucide-react';
import { logout } from '@/services/firebase/authService';

export const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { path: '/admin/enrollments', icon: Users, label: 'Enrollments' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Trainer Panel</h1>
            <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
          </div>
          <nav className="mt-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-4 text-lg font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-6 left-6">
            <button
              onClick={logout}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

