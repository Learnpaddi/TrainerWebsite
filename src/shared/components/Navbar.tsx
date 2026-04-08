import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useRole } from '@/hooks/useRole';

interface NavItem {
  key: 'home' | 'dashboard' | 'courses' | 'settings';
  label: string;
  to: string;
}

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, setRole } = useRole();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = useMemo<NavItem[]>(() => [
    { key: 'home', label: 'Home', to: '/' },
    { key: 'dashboard', label: 'Dashboard', to: '/dashboard' },
    { key: 'courses', label: 'Courses', to: '/courses' },
    { key: 'settings', label: 'Settings', to: '/settings' },
  ], []);

  const isActive = (item: NavItem) => {
    if (item.key === 'home') {
      return location.pathname === '/';
    }
    if (item.key === 'dashboard') {
      return location.pathname === '/dashboard'
        || location.pathname.startsWith('/student/dashboard')
        || location.pathname.startsWith('/trainer/dashboard');
    }
    if (item.key === 'courses') {
      return location.pathname === '/courses'
        || location.pathname.startsWith('/explore')
        || location.pathname.startsWith('/student/course')
        || location.pathname.startsWith('/trainer/add-course')
        || location.pathname.startsWith('/trainer/manage-courses');
    }
    return location.pathname === '/settings' || location.pathname === '/profile';
  };

  const toggleMobileMenu = () => setMobileOpen((open) => !open);

  const handleLogout = () => {
    setRole(null);
    navigate('/select-role?mode=login');
    setMobileOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <img src="/images/Logo.png" alt="LearnPaddi Logo" className="h-12 w-auto rounded-xl transition-all group-hover:scale-105" />
            <span className="text-2xl font-semibold tracking-tight text-corporate-text">LearnPaddi</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive(item)
                    ? 'bg-blue-50 text-corporate-accent'
                    : 'text-corporate-muted hover:bg-slate-50 hover:text-corporate-text'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {profile ? (
              <>
                <span className="hidden lg:inline-flex rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                  {profile.role}
                </span>
                <button type="button" onClick={handleLogout} className="hidden md:inline-flex secondary-cta px-5 py-2.5 text-sm">
                  Logout
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/select-role?mode=login" className="secondary-cta px-5 py-2.5 text-sm">
                  Sign In
                </Link>
                <Link to="/select-role?mode=signup" className="primary-cta px-5 py-2.5 text-sm">
                  Sign Up
                </Link>
              </div>
            )}

            <button
              type="button"
              className="md:hidden rounded-xl p-2 transition hover:bg-gray-100"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="mb-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:hidden">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`block rounded-lg px-4 py-3 text-base font-semibold transition ${
                    isActive(item)
                      ? 'bg-blue-50 text-corporate-accent'
                      : 'text-corporate-muted hover:bg-slate-50'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {profile ? (
                <button type="button" onClick={handleLogout} className="secondary-cta w-full py-3 text-base">
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/select-role?mode=login"
                    className="secondary-cta w-full py-3 text-base"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/select-role?mode=signup"
                    className="primary-cta w-full py-3 text-base"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign Up
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

export default Navbar;
