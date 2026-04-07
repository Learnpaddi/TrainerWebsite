import { useAuth } from '@/hooks/useAuth';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '@/shared/components/Navbar';
import Footer from '@/shared/components/Footer';
import { LogOut, ShieldCheck, Sparkles } from 'lucide-react';

export const AdminLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
      <Navbar />
      <main className="flex-1 p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="lms-panel mb-8 p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-r from-primary to-accent text-white shadow-lg">
                  {user?.email?.[0]?.toUpperCase() || <ShieldCheck className="h-7 w-7" />}
                </div>
                <div>
                  <p className="mb-1 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    Trainer Workspace
                  </p>
                  <h1 className="text-3xl font-black text-gradient-primary">Trainer Panel</h1>
                  <p className="text-primary font-semibold">{user?.email || 'Direct trainer access enabled'}</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="ml-auto inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-gray-700 font-semibold shadow-sm transition-all duration-300 hover:-translate-y-1 hover:text-red-600 hover:shadow-xl"
              >
                <LogOut className="w-5 h-5" />
                Back to Login
              </button>
            </div>
          </div>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};
