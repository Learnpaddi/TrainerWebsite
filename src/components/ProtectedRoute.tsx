import React, { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
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
  const { user, loading, isStudent, isTrainer } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole === 'trainer' && !isTrainer) {
    return <Navigate to="/" replace />;
  }

  if (requireRole === 'student' && !isStudent) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
