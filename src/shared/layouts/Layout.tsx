import type { ReactNode } from 'react';
import Footer from '@/shared/components/Footer';
import Navbar from '@/shared/components/Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
