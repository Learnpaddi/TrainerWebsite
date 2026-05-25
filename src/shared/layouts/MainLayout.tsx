import React from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import Footer from '../components/Footer';

interface MainLayoutProps {
  children?: React.ReactNode;
  contentClassName?: string;
  contentContainer?: boolean;
  showHeader?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  contentClassName = 'max-w-7xl mx-auto px-6 py-12 lg:px-8 lg:py-16',
  contentContainer = true,
  showHeader = true,
}) => {
  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_20%)]" />
      {showHeader && <AppHeader />}
      <main className="relative flex-1">
        {contentContainer ? (
          <div className={contentClassName}>
            {children || <Outlet />}
          </div>
        ) : (
          children || <Outlet />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
