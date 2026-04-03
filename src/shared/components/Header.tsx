import { logout } from '@/services/firebase/authService';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, LogOut } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isStudentPath = location.pathname.startsWith('/student') || ['/', '/courses', '/course'].some(p => location.pathname.startsWith(p));

  const navItems = isStudentPath ? [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/courses', label: 'Courses', icon: '📚' },
    { path: '/my-courses', label: 'My Courses', icon: '⭐' },
  ] : [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/courses', label: 'Courses', icon: '📖' },
    { path: '/admin/enrollments', label: 'Enrollments', icon: '👥' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            <GraduationCap className="w-8 h-8" />
            TrainerApp
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 py-2 px-4 rounded-xl font-semibold transition-all ${
                  location.pathname === item.path 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'text-gray-700 hover:text-primary hover:bg-gray-100'
                }`}
              >
                <span className="w-5">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-semibold shadow-lg">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-semibold text-gray-900">
                  {user.role || 'Student'}
                </span>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex gap-3">
                <Link to="/login" className="px-6 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50 font-semibold transition-all">
                  Login
                </Link>
                <Link to="/register" className="px-6 py-2 bg-primary text-white rounded-2xl font-semibold hover:shadow-lg transition-all">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-100"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t">
            <nav className="flex flex-col gap-2 px-4 pt-4">
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 py-3 px-4 rounded-2xl font-semibold transition-all ${
                    location.pathname === item.path 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="w-6">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 py-3 px-4 rounded-2xl text-left text-red-600 hover:bg-red-50 font-semibold transition-all"
                >
                  <LogOut className="w-6 h-6" />
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="py-3 px-4 text-center border border-gray-300 rounded-2xl hover:bg-gray-50 font-semibold" onClick={() => setMobileOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="py-3 px-4 text-center bg-primary text-white rounded-2xl font-semibold hover:shadow-lg" onClick={() => setMobileOpen(false)}>
                    Get Started
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

