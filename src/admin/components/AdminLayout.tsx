import { useAuth } from '@/hooks/useAuth';
import { Outlet } from 'react-router-dom';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import { logout } from '@/services/firebase/authService';
import { LogOut } from 'lucide-react';

export const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
      <Navbar />
      <main className="flex-1 glass-card p-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8 p-6 bg-white/50 rounded-3xl">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gradient-primary">Trainer Panel</h1>
              <p className="text-primary font-semibold">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="ml-auto glass-card flex items-center gap-3 p-4 hover:bg-red-50/50 hover:text-red-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-gray-700 font-semibold rounded-2xl"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};
