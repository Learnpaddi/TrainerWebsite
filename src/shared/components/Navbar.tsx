import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

interface NavItem {
  path: string;
  label: string;
}

interface NavbarProps {
  roleSpecific?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ roleSpecific = true }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isStudent, isTrainer } = useAuth();

  const commonNavItems: NavItem[] = [
    { path: '/#features', label: 'Features' },
    { path: '/#courses', label: 'Courses' },
    { path: '/#how-it-works', label: 'How it Works' },
    { path: '/#trust', label: 'Trust' },
  ];

  const studentNavItems: NavItem[] = [
    ...commonNavItems,
    { path: '/dashboard', label: 'LMS Dashboard' },
  ];

  const trainerNavItems: NavItem[] = [
    ...commonNavItems,
    { path: '/admin/dashboard', label: 'Admin Dashboard' },
  ];

  const navItems = roleSpecific && isStudent ? studentNavItems : roleSpecific && isTrainer ? trainerNavItems : commonNavItems;

  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-40 glass-header shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-4 group">
            <img src="/images/Logo.png" alt="LearnPaddi Logo" className="h-14 w-auto transition-all group-hover:scale-110 shadow-lg rounded-xl" />
            <span className="text-3xl font-black bg-gradient-to-r from-gray-900 via-primary to-accent bg-clip-text text-transparent drop-shadow-lg tracking-tight">
              Learn<span className="text-transparent bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text">Paddi</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className="text-lg font-medium text-gray-700 hover:text-primary transition-colors duration-200 py-2 relative group"
              >
                {label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
            <Link
              to="/dashboard"
              className="text-lg font-bold bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              Start LMS Learning 
            </Link>
            <Link
              to="/aboutus.html"
              className="text-lg font-bold text-primary bg-primary/10 px-6 py-3 rounded-xl hover:bg-primary/20 transition-all duration-200 border border-primary/20 hover:shadow-lg ml-4"
            >
              About Us
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${mobileOpen ? '' : 'hidden'} pb-4 space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur`}>
          {navItems.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className="block min-h-[44px] py-3 px-4 text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all flex items-center"
              onClick={toggleMobileMenu}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/dashboard"
            className="block py-3 px-6 font-bold text-primary bg-primary/10 dark:bg-primary/20 rounded-xl hover:bg-primary/20 dark:hover:bg-primary/30 transition-all border border-primary/20"
            onClick={toggleMobileMenu}
          >
            Start LMS Learning
          </Link>
          <Link
            to="/aboutus.html"
            className="block py-3 px-6 font-bold text-primary bg-primary/10 dark:bg-primary/20 rounded-xl hover:bg-primary/20 dark:hover:bg-primary/30 transition-all border border-primary/20"
            onClick={toggleMobileMenu}
          >
            About Us
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

