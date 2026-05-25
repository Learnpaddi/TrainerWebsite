import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireRole?: 'student' | 'trainer';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  requireRole 
}) => {
  const { user, loading, authResolved, roleError, isStudent, isTrainer } = useAuth();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  const authRedirectPath = `/select-role?mode=login&from=${encodeURIComponent(returnTo)}`;

  // Do not redirect while auth state is still being determined
  if (loading || !authResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="rounded-2xl border border-white/70 bg-white/90 px-6 py-5 text-center shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Secure Access</p>
          <p className="mt-2 text-base font-bold text-slate-900">Opening your workspace...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to={authRedirectPath} replace state={{ from: returnTo, authMessage: roleError }} />;
  }

  // Show inline error for role/profile issues instead of kicking the user out
  if (roleError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="rounded-2xl border border-red-200 bg-white/90 px-6 py-5 text-center shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-500">Account Issue</p>
          <p className="mt-2 text-base font-bold text-slate-900">{roleError}</p>
          <a href={authRedirectPath} className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700">
            Return to login
          </a>
        </div>
      </div>
    );
  }

  if (requireRole === 'trainer' && !isTrainer) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireRole === 'student' && !isStudent) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
