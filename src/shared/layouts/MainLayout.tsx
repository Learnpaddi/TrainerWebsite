import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-12 lg:px-8 lg:py-16">
          {children || <Outlet />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

